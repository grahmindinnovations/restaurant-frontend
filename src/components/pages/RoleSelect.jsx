import React from 'react'
import tw, { styled, css } from 'twin.macro'
import { useNavigate } from 'react-router-dom'
import { Shield, TrendingUp, ChefHat, Monitor, User, ArrowRight, Settings, Utensils, ClipboardList } from 'lucide-react'
import { roleMeta } from '../../services/roles'

// Background that tries to mimic the "luxury restaurant" feel with a radial gradient
// Ideally, the user would provide the actual background image.
const Page = tw.div`min-h-screen relative overflow-hidden bg-slate-100 flex flex-col items-center justify-center font-sans p-4`
const BgImage = styled.div(() => [
  tw`absolute inset-0 bg-cover bg-center bg-no-repeat`,
  css`
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3)), url('https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=2070&auto=format&fit=crop');
  `,
])

const HeaderContainer = tw.div`relative z-10 text-center mb-8`
const LogoRow = tw.div`flex flex-col items-center justify-center mb-2`
const LogoIcon = tw.div`text-rose-700 mb-1`
const LogoText = styled.div(() => [
  tw`text-4xl font-bold tracking-wide text-rose-800 flex flex-col items-center leading-none`,
  css`
    font-family: 'Times New Roman', serif;
    text-shadow: 0 2px 4px rgba(255,255,255,0.8);
  `
])
const LogoSub = tw.span`text-[10px] font-sans font-bold text-amber-600 tracking-[0.4em] mt-1 uppercase`
const Stars = tw.div`flex gap-1 text-amber-500 mt-1.5 text-sm drop-shadow-sm`

const WelcomeLine = styled.div(() => [
  tw`flex items-center justify-center gap-4 mt-6`,
])

const WelcomeText = styled.span(() => [
  tw`text-slate-600 text-lg italic`,
  css`font-family: 'Times New Roman', serif;`
])

const SystemName = styled.span(() => [
  tw`text-rose-800 font-bold uppercase tracking-widest text-xs not-italic`,
  css`font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`
])

const Line = styled.div(() => [
  tw`h-px w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80`
])

const Board = styled.div(() => [
  tw`relative z-10 w-full max-w-fit bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl px-6 py-6 md:px-10 md:py-8 border border-white/60 mx-4 flex flex-col items-center`,
  css`
    box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  `,
])

const TitleRow = tw.div`text-center mb-5`
const MainTitle = tw.h2`text-xl font-bold text-slate-800`
const RoleText = tw.span`text-rose-700`
const Underline = tw.div`mx-auto mt-1 h-1 w-10 bg-rose-600 rounded-full`

const Grid = tw.div`flex flex-col md:flex-row items-stretch justify-center gap-3 md:gap-4 mb-4`

// Card Styling
const RoleCard = styled.div(() => [
  tw`bg-white rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 relative cursor-pointer h-full w-full md:w-40 lg:w-44`,
  tw`hover:-translate-y-1 hover:shadow-xl`,
  css`
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 6px 10px -3px rgba(0, 0, 0, 0.04);
    border: 2px solid rgba(255, 255, 255, 1);
  `
])

const IconCircle = styled.div(({ bg }) => [
  tw`h-16 w-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 relative`,
  css`
    background: ${bg};
    box-shadow: inset 0 0 15px rgba(0,0,0,0.05);
  `,
  // Add group hover effect via parent class matching
  css`
    .group:hover & {
      transform: scale(1.05);
    }
  `
])

const CardTitle = tw.h3`text-sm font-bold text-rose-800 leading-tight`
const CardSub = tw.p`text-[9px] text-slate-500 font-bold mt-1 mb-3 uppercase tracking-wider`

const ActionBtn = styled.button(({ color }) => [
  tw`w-full py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-md mt-auto`,
  css`background: ${color};`,
  tw`hover:opacity-90 hover:shadow-lg active:scale-95`
])

// Custom Icon Compositions
const AdminIcon = () => (
  <div className="relative">
    <Shield size={36} className="text-rose-600 fill-rose-100" strokeWidth={1.5} />
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
      <Settings size={14} className="text-rose-700" strokeWidth={2.5} />
    </div>
  </div>
)

const ManagerIcon = () => (
  <div className="relative">
    <User size={36} className="text-orange-600 fill-orange-100" strokeWidth={1.5} />
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
      <TrendingUp size={14} className="text-orange-700" strokeWidth={2.5} />
    </div>
  </div>
)

const KitchenIcon = () => (
  <div className="relative">
    <ChefHat size={36} className="text-emerald-600 fill-emerald-100" strokeWidth={1.5} />
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
      <Utensils size={14} className="text-emerald-700" strokeWidth={2.5} />
    </div>
  </div>
)

const ReceptionIcon = () => (
  <div className="relative">
    <Monitor size={36} className="text-blue-600 fill-blue-100" strokeWidth={1.5} />
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
      <User size={14} className="text-blue-700" strokeWidth={2.5} />
    </div>
  </div>
)

const EmployeeIcon = () => (
  <div className="relative">
    <ClipboardList size={36} className="text-violet-600 fill-violet-100" strokeWidth={1.5} />
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
      <User size={14} className="text-violet-700" strokeWidth={2.5} />
    </div>
  </div>
)

const LogoComposition = () => (
  <div className="relative flex flex-col items-center">
    <div className="relative z-10">
      <ChefHat size={56} className="text-rose-700 fill-white" strokeWidth={1.5} />
    </div>
    <div className="absolute top-1 -left-6 rotate-[-30deg] opacity-80">
      <Utensils size={32} className="text-slate-800" strokeWidth={1.5} />
    </div>
    <div className="absolute top-1 -right-6 rotate-[30deg] opacity-80">
      <Utensils size={32} className="text-slate-800" strokeWidth={1.5} />
    </div>
  </div>
)

const Copyright = tw.div`absolute bottom-3 text-[10px] text-slate-500 font-semibold w-full text-center tracking-wide`

export default function RoleSelect() {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      subtitle: 'Full System Access',
      color: 'red',
      icon: <AdminIcon />,
    },
    {
      id: 'manager',
      title: 'Inventory Management System',
      subtitle: 'Stock & Inventory',
      color: 'orange',
      icon: <ManagerIcon />,
    },
    {
      id: 'kitchen',
      title: 'Kitchen Chef',
      subtitle: 'Kitchen & Orders',
      color: 'green',
      icon: <KitchenIcon />,
    },
    {
      id: 'reception',
      title: 'Reception',
      subtitle: 'Orders & Billing',
      color: 'blue',
      icon: <ReceptionIcon />,
    },
    {
      id: 'employee',
      title: 'Staff Management System',
      subtitle: 'Staff & Attendance',
      color: 'purple',
      icon: <EmployeeIcon />,
    },
  ]

  const getGradient = (color) => {
    switch (color) {
      case 'red': return 'linear-gradient(180deg, #9f1239 0%, #881337 100%)'
      case 'orange': return 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)'
      case 'green': return 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)'
      case 'blue': return 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)'
      case 'purple': return 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  }

  const getLightBg = (color) => {
    switch (color) {
      case 'red': return '#ffe4e6' // rose-100
      case 'orange': return '#ffedd5' // orange-100
      case 'green': return '#dcfce7' // emerald-100
      case 'blue': return '#dbeafe' // blue-100
      case 'purple': return '#f3e8ff' // purple-100
    }
  }

  return (
    <Page>
      <BgImage />
      
      <HeaderContainer>
        <LogoRow>
          <LogoIcon>
            <LogoComposition />
          </LogoIcon>
          <div className="mt-4 text-center">
            <LogoText>
              GANESHA
              <LogoSub>HOTELS</LogoSub>
            </LogoText>
            <div className="flex justify-center w-full">
              <Stars>★ ★ ★</Stars>
            </div>
          </div>
        </LogoRow>

        <WelcomeLine>
          <Line />
          <WelcomeText>
            Welcome to <SystemName>Restaurant Management System</SystemName>
          </WelcomeText>
          <Line />
        </WelcomeLine>
      </HeaderContainer>

      <Board>
        <TitleRow>
          <MainTitle>Choose Your <RoleText>Role</RoleText></MainTitle>
          <Underline />
        </TitleRow>

        <Grid>
          {roles.map((role) => (
            <div key={role.id} className="relative flex flex-col items-center group">
              <RoleCard onClick={() => navigate(`/login?role=${encodeURIComponent(role.id)}`)}>
                <IconCircle bg={getLightBg(role.color)}>
                  {role.icon}
                </IconCircle>
                <CardTitle>{role.title}</CardTitle>
                <CardSub>{role.subtitle}</CardSub>
                <ActionBtn color={getGradient(role.color)}>
                  Login <ArrowRight size={18} />
                </ActionBtn>
              </RoleCard>
            </div>
          ))}
        </Grid>

        <Copyright>© 2025 <span className="text-rose-700 font-bold">Ganesha Hotels</span> | All Rights Reserved</Copyright>
      </Board>
    </Page>
  )
}
