
import Icon from '@mdi/react'
import { mdiLoading } from '@mdi/js'
export default function Loading() {
  return (<div style={{
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <Icon path={mdiLoading} size={2} spin />
  </div>)
}