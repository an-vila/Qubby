import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  // Importamos estos módulos para que funcionen las directivas en el HTML
  imports: [CommonModule, ReactiveFormsModule, FormsModule], 
  templateUrl: './ui-input.component.html',
  styleUrls: ['./ui-input.component.css']
  // ⚠️ NOTA: He quitado el array 'providers' aquí. 
  // Al inyectar NgControl en el constructor, ya no hace falta y evita errores circulares.
})
export class UiInputComponent implements ControlValueAccessor {

  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';

  value: string = '';
  disabled = false;

  // Funciones placeholder
  onChange = (_: any) => {};
  onTouched = () => {};

  // 1. INYECCIÓN DE DEPENDENCIA (La clave para arreglar tu error)
  // Con esto accedemos al formulario padre para ver si hay errores
  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl) {
      // Conectamos el componente con Angular
      this.ngControl.valueAccessor = this;
    }
  }

  // 2. EL GETTER QUE NECESITA TU HTML
  // Esto permite usar "control.invalid" en la plantilla
  get control(): FormControl {
    return this.ngControl?.control as FormControl;
  }

  // --- MÉTODOS STANDARD DE CONTROL VALUE ACCESSOR ---

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched(); // Es bueno marcarlo como "tocado" al escribir
  }
}