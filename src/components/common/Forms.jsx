import tw, { styled } from 'twin.macro'

export const Button = styled.button(({ variant }) => [
  tw`px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95`,
  variant === 'primary' ? tw`bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200` :
  variant === 'danger' ? tw`bg-red-50 text-red-600 hover:bg-red-100 border border-red-200` :
  tw`bg-white text-slate-600 border border-slate-200 hover:bg-slate-50`
])

export const Input = tw.input`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500`
export const Label = tw.label`text-xs font-bold text-slate-500 uppercase tracking-wide`
export const FormGroup = tw.div`flex flex-col gap-1.5`
