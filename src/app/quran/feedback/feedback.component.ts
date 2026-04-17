import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback',
  standalone: false,
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  selectedFileName = '';
  isSubmitting = false;
  submitSuccess = false;
  source = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private feedbackService: FeedbackService,
    private message: NzMessageService,
  ) {
    this.form = this.fb.group({
      name: [''],
      email: ['', [Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.source = this.route.snapshot.queryParamMap.get('source') || '';
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.message.error('Only JPG, PNG, or WebP images are allowed.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.message.error('Image must be under 5MB.');
      input.value = '';
      return;
    }
    this.selectedFile = file;
    this.selectedFileName = file.name;
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => {
        c.markAsDirty();
        c.updateValueAndValidity();
      });
      return;
    }
    this.isSubmitting = true;
    const fd = new FormData();
    fd.append('message', this.form.value.message.trim());
    if (this.form.value.name?.trim()) fd.append('name', this.form.value.name.trim());
    if (this.form.value.email?.trim()) fd.append('email', this.form.value.email.trim());
    if (this.source) fd.append('source', this.source);
    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.feedbackService.submitFeedback(fd).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.form.reset();
        this.selectedFile = null;
        this.selectedFileName = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to send feedback. Please try again.';
        this.message.error(msg);
      },
    });
  }

  sendAnother(): void {
    this.submitSuccess = false;
  }
}
