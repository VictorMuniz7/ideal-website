import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../config/site.config';

/**
 * Título, descrição, Open Graph, Twitter Card e dados estruturados (JSON-LD).
 *
 * Roda no pré-render: o HTML estático já sai completo para buscadores e para
 * a prévia de link do WhatsApp. Na hidratação, a marcação já existe e nada é
 * duplicado.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly titulo = inject(Title);
  private readonly meta = inject(Meta);

  aplicar(): void {
    if (this.document.head.querySelector('script[type="application/ld+json"]')) return;

    const { seo, empresa, contato, endereco } = SITE;
    // Canonical e og:url só existem com domínio definido; a imagem precisa de
    // endereço absoluto, então usa o domínio ou, na falta dele, o link publicado.
    const dominio = SITE.dominio;
    const base = dominio || SITE.urlPublicacao;
    const imagem = base ? new URL('og-image.jpg', base).href : 'og-image.jpg';

    this.titulo.setTitle(seo.titulo);
    this.meta.addTags([
      { name: 'description', content: seo.descricao },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:site_name', content: empresa.nome },
      { property: 'og:title', content: seo.titulo },
      { property: 'og:description', content: seo.descricao },
      { property: 'og:image', content: imagem },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: `Logo da ${empresa.nome} — ${empresa.slogan}, ${empresa.cidade}/${empresa.uf}` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seo.titulo },
      { name: 'twitter:description', content: seo.descricao },
      { name: 'twitter:image', content: imagem },
    ]);

    if (dominio) {
      this.meta.addTag({ property: 'og:url', content: dominio });
      const canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', dominio);
      this.document.head.appendChild(canonical);
    }

    const negocio = {
      '@type': 'LocalBusiness',
      '@id': `${dominio || ''}#laboratorio`,
      name: empresa.razaoSocial,
      alternateName: empresa.nome,
      description: seo.descricao,
      ...(dominio ? { url: dominio } : {}),
      ...(base ? { image: imagem, logo: new URL('icon-512.png', base).href } : {}),
      telephone: contato.telefone.e164,
      email: contato.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: endereco.logradouro,
        addressLocality: endereco.cidade,
        addressRegion: endereco.uf,
        postalCode: endereco.cep,
        addressCountry: 'BR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: endereco.latitude, longitude: endereco.longitude },
      hasMap: endereco.mapaLink,
      areaServed: { '@type': 'Country', name: 'Brasil' },
      sameAs: [contato.instagram.url],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: `+${contato.whatsapp.e164}`,
        availableLanguage: 'pt-BR',
      },
      openingHoursSpecification: SITE.horarios.flatMap((h) =>
        h.intervalos.map((i) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.diasSchema,
          opens: i.abre,
          closes: i.fecha,
        })),
      ),
      makesOffer: SITE.analises.itens.map((a) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: a.titulo, description: a.resumo },
      })),
    };

    const faq = {
      '@type': 'FAQPage',
      mainEntity: SITE.duvidas.itens.map((d) => ({
        '@type': 'Question',
        name: d.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: d.resposta },
      })),
    };

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({ '@context': 'https://schema.org', '@graph': [negocio, faq] });
    this.document.head.appendChild(script);
  }
}
