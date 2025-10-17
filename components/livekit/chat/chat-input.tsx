import { useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onChange'> {
  onSend?: (message: string) => void;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export function ChatInput({
  onSend,
  className,
  disabled,
  value,
  onChange,
  ...props
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onSubmit?.(e);
    if (value.trim().length > 0) {
      onSend?.(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim().length > 0) {
        onSend?.(value);
      }
    }
  };

  const isDisabled = disabled || value.trim().length === 0;

  useEffect(() => {
    if (disabled) return;
    // when not disabled refocus on input
    textareaRef.current?.focus();
  }, [disabled]);

  return (
    <form
      {...props}
      onSubmit={handleSubmit}
      className={cn('flex items-center gap-2 rounded-md pl-1 text-sm', className)}
    >
      <TextareaAutosize
        ref={textareaRef}
        value={value}
        disabled={disabled}
        placeholder="Type something..."
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        maxRows={5}
        className="placeholder:text-muted-foreground flex-1 resize-none bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button
        size="sm"
        type="submit"
        variant={isDisabled ? 'secondary' : 'primary'}
        disabled={isDisabled}
        className="font-mono"
      >
        SEND
      </Button>
    </form>
  );
}
