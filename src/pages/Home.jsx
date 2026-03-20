import IntroductionTab from '../components/Introduction/IntroductionTab'
import ExperienceTab from '../components/Experience/ExperienceTab'
import ServiceUXTab from '../components/ServiceUX/ServiceUXTab'
import VPCTab from '../components/VPC/VPCTab'
import PrototypeTab from '../components/Prototype/PrototypeTab'

export default function Home({ activeTab }) {
  const renderTab = () => {
    switch (activeTab) {
      case 'introduction': return <IntroductionTab />
      case 'experience':   return <ExperienceTab />
      case 'service-ux':   return <ServiceUXTab />
      case 'vpc':          return <VPCTab />
      case 'prototype':    return <PrototypeTab />
      default:             return <ServiceUXTab />
    }
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', fontFamily: 'Noto Sans KR, sans-serif' }}>
      {renderTab()}
    </main>
  )
}
