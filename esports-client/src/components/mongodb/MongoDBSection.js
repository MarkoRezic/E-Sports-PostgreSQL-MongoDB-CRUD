import { Route, Routes } from 'react-router-dom'
import { MongoDBTable } from './MongoDBTable'

export const MongoDBSection = () => {

    return (
        <div className="section">
            MongoDB
            <Routes>
                <Route path="/:table_name" element={<MongoDBTable />} />
            </Routes>
        </div>
    )
}