type FaqItem = { question: string; answer: string }

type FaqJsonLdProps = {
  items: readonly FaqItem[]
}

/** FAQPage structured data — lets answer engines (Google AI Overviews, ChatGPT, Perplexity) surface these Q&As directly. */
export function FaqJsonLd({ items }: FaqJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      // Values come from our own message catalogue, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
