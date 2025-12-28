import { useEffect, useRef } from 'react';
import { useTranslation } from '../../context/TranslationContext';

/**
 * Component that automatically translates all text content within it
 * Usage: Wrap any component with <AutoTranslateWrapper>...</AutoTranslateWrapper>
 * 
 * Note: This is a simple implementation. For better performance, use TranslatableText for specific text elements.
 */
export const AutoTranslateWrapper = ({ children, className, ...props }) => {
  const containerRef = useRef(null);
  const { translate, currentLanguage, isTranslationNeeded } = useTranslation();

  useEffect(() => {
    if (!containerRef.current || !isTranslationNeeded) return;

    const translateTextNodes = async (node) => {
      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if parent is script, style, or already translated
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.dataset.translated === 'true') {
              return NodeFilter.FILTER_REJECT;
            }
            // Only translate non-empty text nodes
            return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          },
        },
        false
      );

      const textNodes = [];
      let textNode;
      while ((textNode = walker.nextNode())) {
        textNodes.push(textNode);
      }

      // Translate all text nodes
      for (const node of textNodes) {
        const originalText = node.textContent.trim();
        if (originalText && originalText.length > 0) {
          try {
            const translated = await translate(originalText);
            if (translated && translated !== originalText) {
              node.textContent = translated;
              if (node.parentElement) {
                node.parentElement.dataset.translated = 'true';
              }
            }
          } catch (error) {
            // Silently skip failed translations
            if (process.env.NODE_ENV === 'development') {
              console.warn('Translation failed in AutoTranslateWrapper:', error.message);
            }
          }
        }
      }
    };

    translateTextNodes(containerRef.current);
  }, [currentLanguage, translate, isTranslationNeeded]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
};

export default AutoTranslateWrapper;

