import React from 'react'
import { send } from '../../client/ipc'
import { DetailsContainer } from '../components/DetailsContainer'
import { NameField } from '../components/NameField'
import { useAddPier } from '../useAddPier'

export const RemotePierDetails = () => {
    const {
        mutate,
        form
    } = useAddPier((data) => {
        return send('add-pier', { 
            ...data,
            booted: true,
            running: true, 
            type: 'remote' 
        })
    }, false)

    const { isValid } = form.formState;

    return (
        <DetailsContainer
            title="Remote Ship Details"
            buttonDisabled={!isValid}
            onSubmit={form.handleSubmit(data => mutate(data))}
        >
            <h1 className="font-semibold text-base mb-6">Enter Ship Details</h1>
            <div>
                <label htmlFor="name">Name <span className="text-gray-700">(local only)</span></label>
                <NameField form={form} />
            </div>
            <div>
                <label htmlFor="directory">URL</label>
                <input 
                    id="directory" 
                    name="directory"
                    type="text"
                    ref={form.register({ required: true })}
                    className="flex w-full px-2 py-1 mt-2 bg-transparent border border-gray-700 focus:outline-none focus:border-gray-500 transition-colors rounded" 
                    placeholder="https://myurbit.com"
                />
            </div>
        </DetailsContainer>
    )
}