import { useState, useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { PostgresTable } from './PostgresTable'
import '../../css/Loaders.css'
import axios from 'axios'

export const PostgresSection = () => {
    const [tables, setTables] = useState([])

    useEffect(() => {
        axios.get('http://localhost:3001/postgres/tables').then((response) => {
            console.log(response)
            setTables(response.data.result.rows)
            console.log(response.data.result.rows)
        })
        return () => {
        }
    }, [])

    return (
        <div className="section">
            <header>
                {
                    tables.length === 0 ?
                        <svg className="loader progress" width="80" height="80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="30"></circle>
                        </svg>
                        : tables.map((table, index) => <NavLink className={({ isActive }) => 'postgres nav-link' + (isActive ? ' nav-active' : '')} to={table.table_name} key={index}> {table.table_name} </NavLink>)
                }
            </header>
            <Routes>
                <Route path=":table_name" element={<PostgresTable />} />
            </Routes>
        </div>
    )
}