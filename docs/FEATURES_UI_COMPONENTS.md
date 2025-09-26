# 🎨 UI Components & Design System

## Overview
Sistem komponen UI yang komprehensif menggunakan shadcn/ui dengan Tailwind CSS, menyediakan komponen yang konsisten, accessible, dan responsive.

## 🎯 Fitur Utama

### 1. **Base UI Components**
- **Form Components**: Input, textarea, select, checkbox
- **Layout Components**: Card, dialog, separator
- **Interactive Components**: Button, dropdown, table
- **Feedback Components**: Toast, progress, skeleton

### 2. **Design System**
- **Consistent Styling**: Unified design language
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components
- **Theme Support**: Dark/light theme support

### 3. **Component Library**
- **Reusable Components**: Modular component system
- **TypeScript Support**: Full TypeScript integration
- **Customizable**: Easy customization and theming
- **Documentation**: Comprehensive component docs

## 🛠️ Technical Implementation

### Component Structure
```
src/components/ui/
├── avatar.tsx           # User avatar component
├── badge.tsx            # Status badge component
├── button.tsx           # Button component
├── card.tsx             # Card layout component
├── checkbox.tsx         # Checkbox input component
├── dialog.tsx           # Modal dialog component
├── dropdown-menu.tsx    # Dropdown menu component
├── form.tsx             # Form wrapper component
├── input.tsx            # Text input component
├── label.tsx            # Form label component
├── progress.tsx         # Progress indicator
├── select.tsx           # Select dropdown component
├── separator.tsx        # Visual separator
├── skeleton.tsx         # Loading skeleton
├── sonner.tsx           # Toast notification
├── table.tsx            # Data table component
└── textarea.tsx         # Textarea input component
```

### Base Component Example
```typescript
// Button component
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

## 📱 Component Categories

### Form Components

#### Input Component
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

#### Select Component
```typescript
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      {children}
    </SelectPrimitive.Root>
  )
}
```

#### Form Wrapper
```typescript
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

const Form = ({ children, ...props }: FormProps) => {
  return (
    <form {...props}>
      <FormProvider>
        {children}
      </FormProvider>
    </form>
  )
}
```

### Layout Components

#### Card Component
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
)

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
```

#### Dialog Component
```typescript
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  )
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
)
```

### Data Display Components

#### Table Component
```typescript
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
)

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
)

const TableBody = React.forwardRef<HTMLTableSectionElement, TableProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
)
```

#### Badge Component
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
            "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80": variant === "destructive",
            "text-foreground": variant === "outline",
          },
          className
        )}
        {...props}
      />
    )
  }
)
```

## 🎨 Design System

### Color Palette
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Typography
```css
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
```

### Spacing System
```css
.space-1 { margin: 0.25rem; }
.space-2 { margin: 0.5rem; }
.space-3 { margin: 0.75rem; }
.space-4 { margin: 1rem; }
.space-6 { margin: 1.5rem; }
.space-8 { margin: 2rem; }
.space-12 { margin: 3rem; }
.space-16 { margin: 4rem; }
```

## 🔧 Component Utilities

### Class Name Utilities
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Variant Props
```typescript
import { cva, type VariantProps } from "class-variance-authority"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        secondary: "secondary-classes",
        destructive: "destructive-classes",
      },
      size: {
        default: "default-size",
        sm: "small-size",
        lg: "large-size",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Responsive Components
```typescript
// Responsive grid component
const ResponsiveGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {children}
  </div>
)

// Responsive text component
const ResponsiveText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm sm:text-base lg:text-lg">
    {children}
  </p>
)
```

## ♿ Accessibility Features

### ARIA Support
```typescript
// Accessible button component
const AccessibleButton = ({ children, ...props }: ButtonProps) => (
  <button
    role="button"
    tabIndex={0}
    aria-label="Button"
    {...props}
  >
    {children}
  </button>
)

// Accessible form component
const AccessibleForm = ({ children, ...props }: FormProps) => (
  <form
    role="form"
    aria-label="Form"
    {...props}
  >
    {children}
  </form>
)
```

### Keyboard Navigation
```typescript
// Keyboard navigation support
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    // Handle action
  }
}
```

## 🎨 Theme Support

### Dark Mode
```typescript
// Theme provider
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light')
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      {children}
    </div>
  )
}
```

### Theme Toggle
```typescript
// Theme toggle component
const ThemeToggle = () => {
  const [theme, setTheme] = useState('light')
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </Button>
  )
}
```

## 🚀 Usage Examples

### Basic Component Usage
```typescript
// Button usage
<Button variant="default" size="lg">
  Click me
</Button>

// Card usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content
  </CardContent>
</Card>

// Form usage
<Form>
  <Input placeholder="Enter text" />
  <Button type="submit">Submit</Button>
</Form>
```

### Advanced Component Usage
```typescript
// Custom component with variants
const CustomButton = ({ variant, size, ...props }: CustomButtonProps) => (
  <Button
    variant={variant}
    size={size}
    className="custom-classes"
    {...props}
  />
)

// Component composition
const DataCard = ({ title, data }: DataCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)
```

## 📊 Future Enhancements

### Planned Features
- **Animation Library**: Smooth animations and transitions
- **Advanced Charts**: Data visualization components
- **Mobile Components**: Mobile-specific components
- **Accessibility Tools**: Enhanced accessibility features

### Advanced Features
- **Component Testing**: Automated component testing
- **Storybook Integration**: Component documentation
- **Design Tokens**: Centralized design tokens
- **Component Generator**: Automated component generation
