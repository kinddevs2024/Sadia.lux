import { useEffect, useRef } from 'react';
import { useTranslation } from '../../context/TranslationContext';

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
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.dataset.translated === 'true') {
              return NodeFilter.FILTER_REJECT;
            }
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

