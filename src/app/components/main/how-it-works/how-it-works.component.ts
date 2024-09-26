import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss'
})
export class HowItWorksComponent implements AfterViewInit{
  @ViewChild('carousel') carousel!: ElementRef
  index: number = 0
  totalItems: number = 7
  itemWidth: number = 200

  constructor(){
    this.prev = this.debounce(this.prev.bind(this), 300)
    this.next = this.debounce(this.next.bind(this), 300)
  }

  ngAfterViewInit() {
    this.itemWidth = this.carousel.nativeElement.querySelector('.carousel-item').offsetWidth;
  }

  next(){
    if(this.index >= this.totalItems - 1){
      this.scrollTo(0)
      this.index = 0
    } else {
      this.scrollTo(this.index + 1)
      this.index++
    }
  }

  prev(){
    if(this.index <= 0){
      this.scrollTo(this.totalItems - 1)
      this.index = this.totalItems - 1
    } else {
      this.scrollTo(this.index - 1)
      this.index--
    }
  }

  scrollTo(index: number) {
    const newPosition = index * this.itemWidth;
    this.carousel.nativeElement.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
  }

  debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: any;
    return  (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}
