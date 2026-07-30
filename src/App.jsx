import AppRoutes from './routes/AppRoutes'
import TrafficTracker from './components/common/TrafficTracker'
import LoadingScreen from './components/common/LoadingScreen'
import { useCatalog } from './contexts/CatalogContext'

export default function App(){
  const {loading}=useCatalog()
  if(loading)return <LoadingScreen/>
  return <><TrafficTracker/><AppRoutes/></>
}
