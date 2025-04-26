
import { cn } from '@/lib/utils';
import { ProgressProps } from '@radix-ui/react-progress';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps extends ProgressProps {
  value: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  value, 
  showLabel = true, 
  className,
  ...props 
}: ProgressBarProps) {
  return (
    <div className="w-full space-y-1">
      <Progress 
        value={value} 
        className={cn("h-2", className)}
        {...props}
      />
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">
          {Math.round(value)}%
        </p>
      )}
    </div>
  );
}
