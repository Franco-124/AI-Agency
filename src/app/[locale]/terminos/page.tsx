import { LegalPage, legalMetadata, type LegalPageProps } from '@/components/legal/LegalPage'
import { locales } from '@/i18n/routing'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export const generateMetadata = (props: LegalPageProps) => legalMetadata('terms', props)

export default function TermsPage(props: LegalPageProps) {
  return <LegalPage doc="terms" {...props} />
}
