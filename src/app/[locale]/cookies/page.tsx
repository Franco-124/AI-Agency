import { LegalPage, legalMetadata, type LegalPageProps } from '@/components/legal/LegalPage'
import { locales } from '@/i18n/routing'

export const generateStaticParams = () => locales.map((locale) => ({ locale }))

export const generateMetadata = (props: LegalPageProps) => legalMetadata('cookies', props)

export default function CookiesPage(props: LegalPageProps) {
  return <LegalPage doc="cookies" {...props} />
}
