import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoxDetailPageComponent } from './box-detail-page.component';

describe('BoxDetailPageComponent', () => {
  let component: BoxDetailPageComponent;
  let fixture: ComponentFixture<BoxDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoxDetailPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoxDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});