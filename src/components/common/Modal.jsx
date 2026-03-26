import React from 'react'
import tw from 'twin.macro'
import { X } from 'lucide-react'

const Overlay = tw.div`fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm`
const Content = tw.div`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden`
const Header = tw.div`px-6 py-4 border-b border-slate-100 flex items-center justify-between`
const Title = tw.h3`font-bold text-lg text-slate-800`
const CloseBtn = tw.button`text-slate-400 hover:text-slate-600`
const Body = tw.div`p-6 space-y-4`
const Footer = tw.div`px-6 py-4 bg-slate-50 flex items-center justify-end gap-3`

export default function Modal({ title, onClose, children, footer }) {
  return (
    <Overlay onClick={onClose}>
      <Content onClick={e => e.stopPropagation()}>
        <Header>
          <Title>{title}</Title>
          <CloseBtn onClick={onClose}><X size={20} /></CloseBtn>
        </Header>
        <Body>{children}</Body>
        {footer && <Footer>{footer}</Footer>}
      </Content>
    </Overlay>
  )
}
