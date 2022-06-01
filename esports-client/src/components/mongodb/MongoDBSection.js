import { useState, useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { MongoDBTable } from './MongoDBTable'
import '../../css/Loaders.css'
import axios from 'axios'

export const MongoDBSection = () => {
    const [collections, setCollections] = useState([])

    useEffect(() => {
        axios.get('http://localhost:3001/mongo/collections').then((response) => {
            console.log(response)
            setCollections(response.data.result)
            console.log(response.data.result)
        })
        return () => {
        }
    }, [])

    return (
        <div className="section">
            <header>
                {
                    collections.length === 0 ?
                        <svg className="loader mongodb progress" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="30"></circle>
                        </svg>
                        : collections.map((collection, index) => <NavLink className={({ isActive }) => 'mongodb nav-link' + (isActive ? ' nav-active' : '')} to={collection.name} key={index}> {collection.name} </NavLink>)
                }
            </header>
            <Routes>
                <Route path=":collection_name" element={<MongoDBTable />} />
            </Routes>
        </div>
    )
}