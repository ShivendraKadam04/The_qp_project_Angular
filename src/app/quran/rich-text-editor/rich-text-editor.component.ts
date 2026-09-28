import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

/**
 * Lightweight WYSIWYG + HTML-source editor used by admins to edit appendices.
 * Built on contenteditable so arbitrary appendix HTML (anchors, inline styles,
 * tables) survives round-trips untouched — no third-party editor bundle needed.
 */
@Component({
  selector: 'app-rich-text-editor',
  standalone: false,
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.css'
})
export class RichTextEditorComponent implements AfterViewInit {
  @Input() html = '';
  @Input() saving = false;
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('visual') visualEl?: ElementRef<HTMLDivElement>;

  htmlMode = false;
  source = '';
  textColor = '#B8860B';

  readonly blockStyles = [
    { label: 'Paragraph', tag: 'P' },
    { label: 'Heading 1', tag: 'H1' },
    { label: 'Heading 2', tag: 'H2' },
    { label: 'Heading 3', tag: 'H3' },
    { label: 'Quote', tag: 'BLOCKQUOTE' },
  ];

  ngAfterViewInit() {
    this.setVisual(this.html);
  }

  /** Keeps the current selection when a toolbar button is pressed. */
  keepSelection(event: MouseEvent) {
    event.preventDefault();
  }

  exec(command: string, value?: string) {
    if (this.htmlMode) return;
    this.visualEl?.nativeElement.focus();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, value);
  }

  setBlock(tag: string) {
    this.exec('formatBlock', tag);
  }

  insertLink() {
    const url = prompt('Link URL (https://… or #section-id)');
    if (url) this.exec('createLink', url);
  }

  applyColor(color: string) {
    this.textColor = color;
    this.exec('foreColor', color);
  }

  toggleHtmlMode() {
    if (this.htmlMode) {
      this.htmlMode = false;
      // The visual div is re-created by *ngIf; fill it once it exists.
      setTimeout(() => this.setVisual(this.source));
    } else {
      this.source = this.currentHtml();
      this.htmlMode = true;
    }
  }

  onSave() {
    this.save.emit(this.currentHtml());
  }

  private currentHtml(): string {
    return this.htmlMode ? this.source : (this.visualEl?.nativeElement.innerHTML ?? this.html);
  }

  private setVisual(html: string) {
    if (this.visualEl) this.visualEl.nativeElement.innerHTML = html;
  }
}
