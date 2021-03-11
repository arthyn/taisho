import { format } from 'date-fns'
import React from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Link, useHistory, useLocation, useParams } from 'react-router-dom'
import { send } from '../client/ipc'
import { LeftArrow } from '../icons/LeftArrow'
import { RightArrow } from '../icons/RightArrow'
import { Upload } from '../icons/Upload'
import { Layout } from '../shared/Layout'
import { Spinner } from '../shared/Spinner'
import { getCometShortName } from '../shared/urbit-utils'
import { Close } from '../icons/Close'
import * as Dialog from '@radix-ui/react-dialog'


export const Ship = () => {
    const history = useHistory()
    const location = useLocation()
    const { slug } = useParams<{ slug: string }>()
    const queryClient = useQueryClient();
    const { data: ship } = useQuery(['pier', slug], async () => {
        const pier = await send('get-pier', slug)
        return send('check-pier', pier)
    }, {
        refetchOnWindowFocus: false
    })
    const { mutate: stopShip } = useMutation(async () => send('stop-pier', ship), {
        onSuccess: () => {
            queryClient.invalidateQueries(['pier', slug])
        }
    })

    if (!ship) {
        return <Layout title="Loading Ship..." className="flex justify-center items-center min-content-area-height">
            <Spinner className="h-24 w-24" />
        </Layout>
    }

    const deleteShip = async () => {
        await send('delete-pier', ship);
        history.push('/')
    }

    const formattedDate = format(new Date(ship.lastUsed), 'HH:mm MM-dd-yyyy')

    return (
        <Layout 
            title={ship.name} 
            className="flex justify-center items-center min-content-area-height pt-8 text-gray-500"
            footer={
                <Link to="/" className="inline-flex items-center ml-2 mr-8 text-xs text-gray-500 hover:text-white focus:text-white transition-colors">
                    <LeftArrow className="w-5 h-5 mr-2" secondary="fill-current" />
                    Home
                </Link>
            }
        >
            <section className="w-full max-w-md mr-6">
                <header className="flex items-center">
                    <div className="mr-6">
                        <h1 className="text-xl font-semibold text-white">{ ship.name }</h1>
                        { ship.booted && 
                            <div className="flex items-center text-sm">
                                <span className={`inline-flex w-2 h-2 mr-2 rounded-full ${ship.running ? 'bg-green-400' : 'bg-gray-700'}`}></span>
                                <span>{ship.running ? 'Running' : 'Stopped'}</span>
                                {ship.running && ship.type !== 'remote' && <button className="px-1 ml-3 font-semibold text-gray-700 hover:text-red-800 focus:text-red-800 hover:border-red-900 focus:border-red-900 rounded default-ring border border-gray-700 transition-colors" onClick={() => stopShip()}>Stop</button>}
                            </div>
                        }
                        { !ship.booted &&
                            <span className="text-sm">Unbooted</span>
                        }
                    </div>
                    <div className="ml-auto">
                        { ship.booted &&
                            <Link to={`${location.pathname}/launch`} className="button" onClick={async () => await send('clear-data')}>
                                { ship.running ? 'Open' : 'Launch' } <RightArrow className="ml-1 w-7 h-7" secondary="fill-current"/>
                            </Link>
                        }
                        { !ship.booted &&
                            <Link to={`/boot/comet/${ship.slug}`} className="button">
                                Boot <RightArrow className="ml-1 w-7 h-7" secondary="fill-current"/>
                            </Link>
                        }
                    </div>
                </header>
                <hr className="my-3 border-gray-700"/>
                <div className="space-y-4 mb-16">
                    <p className="flex items-center">{ ship.shipName && getCometShortName(ship.shipName) } <span className="ml-auto">{ formattedDate }</span></p>
                    <p>{ ship.directory }</p>
                </div>                
                <h2 className="font-semibold">Ship Removal</h2>
                <hr className="mt-1 mb-3 border-gray-700"/>
                <div className="flex items-center font-semibold">
                    <Dialog.Root>
                        <Dialog.Trigger className="mr-3 text-gray-700 hover:text-red-800 focus:text-red-800 transition-colors default-ring">
                            Delete
                        </Dialog.Trigger>
                        <Dialog.Overlay className="fixed z-10 top-0 left-0 right-0 bottom-0 bg-black opacity-30" />
                        <Dialog.Content className="fixed z-40 top-1/2 left-1/2 min-w-80 bg-gray-900 rounded transform -translate-y-1/2 -translate-x-1/2">
                            <div className="relative p-4">
                                <div className="my-6 pr-6">Are you sure you want to delete your ship? This action is irreversible.</div>
                                <div className="flex justify-end items-center">
                                    <Dialog.Close className="text-gray-500 hover:text-white focus:text-white transition-colors mr-3 default-ring">Cancel</Dialog.Close>
                                    <Dialog.Close className="button text-red-600 hover:text-red-600 focus:text-red-600 border border-red-900 hover:border-red-700 focus:border-red-700 focus:outline-none transition-colors default-ring" onClick={async () => await deleteShip()}>Delete</Dialog.Close>
                                </div>
                                <Dialog.Close className="absolute top-2 right-2 text-gray-700 hover:text-gray-500 focus:text-gray-500 default-ring rounded">
                                    <Close className="w-7 h-7" primary="fill-current" />
                                </Dialog.Close>
                            </div>
                            
                        </Dialog.Content>
                    </Dialog.Root>
                    { ship.type !== 'remote' &&
                        <button className="button">
                            <Upload className="w-5 h-5 mr-2" primary="fill-current opacity-50" secondary="fill-current" /> Eject 
                        </button>
                    }
                </div>
            </section>
        </Layout>
    )
}