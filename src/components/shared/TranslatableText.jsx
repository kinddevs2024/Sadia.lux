import { useAutoTranslate } from '../../hooks/useAutoTranslate';

/**
 * Component that automatically translates text based on current language
 * Usage: <TranslatableText>Текст на русском</TranslatableText>
 */
export const TranslatableText = ({ children, as: Component = 'span', className, ...props }) => {
  const text = typeof children === 'string' ? children : String(children || '');
  const translatedText = useAutoTranslate(text);

  return <Component className={className} {...props}>{translatedText}</Component>;
};

export default TranslatableText;

