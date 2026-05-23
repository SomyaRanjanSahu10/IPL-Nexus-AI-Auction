import { Provider } from 'react-redux'
import { store } from '../store'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page)
  return (
    <Provider store={store}>
      {getLayout(<Component {...pageProps} />)}
    </Provider>
  )
}
