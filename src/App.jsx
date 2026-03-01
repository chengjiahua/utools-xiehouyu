import { useEffect, useState } from 'react'
import Hello from './Hello'
import Read from './Read'
import Write from './Write'
import Xiehouyu from './Xiehouyu'

export default function App () {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')

  useEffect(() => {
    if (typeof window.utools === 'undefined') {
      console.warn('window.utools is not available, running in browser mode')
      setRoute('xiehouyu')
      setEnterAction({ code: 'xiehouyu', type: 'text', payload: '' })
      return
    }

    window.utools.onPluginEnter((action) => {
      setRoute(action.code)
      setEnterAction(action)
    })
    window.utools.onPluginOut((isKill) => {
      setRoute('')
    })
  }, [])

  if (route === 'xiehouyu') {
    return <Xiehouyu enterAction={enterAction} />
  }

  if (route === 'hello') {
    return <Hello enterAction={enterAction} />
  }

  if (route === 'read') {
    return <Read enterAction={enterAction} />
  }

  if (route === 'write') {
    return <Write enterAction={enterAction} />
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#666'
    }}>
      请在 uTools 中运行此插件
    </div>
  )
}
