import * as mysql from 'mysql2'
import * as mysqlPromise from 'mysql2/promise'
import { IData } from './generateData'

export const emptyTable = async (connection: mysqlPromise.Connection, tableName: string) => {
    const query = `TRUNCATE TABLE ${tableName}`
    
    connection.query(query)
}

export const getTable = (connection: mysql.Connection, tableName: string, callback: (result: IData[]) => void) => {
    const query = `SELECT * FROM ${tableName}`
    
    connection.query(query, (err, result) => {
        if (err) throw err
        // convert data to IData

    })
}

export const insertDataintoBO = (connection: mysql.Connection, tableName: string, data: IData) => {
    const query = `INSERT INTO ${tableName} (article, quantite, prix, date) VALUES ${data.map(row => `("${row.article}", ${row.quantite}, ${row.prix}, "${row.date}")`).join(', ')}`
    
    return connection.query(query, (err, result) => {
        if (err) throw err
        console.log(`data inserted`)
    })
}

export const insertDataintoHO = (connection: mysql.Connection, tableName: string, data: IData, source: string) => {
    const query = `INSERT INTO ${tableName} (article, quantite, prix, date, source) VALUES ${data.map(row => `("${source}", "${row.article}", ${row.quantite}, ${row.prix}, "${row.date}")`).join(', ')}`
    
    connection.query(query, (err, result) => {
        if (err) throw err
        console.log(`data inserted`)
    })
}

export const checkTable = (connection: mysql.Connection, tableName: string) => {
    const query = `SELECT * FROM ${tableName}`
    
    connection.query(query, (err, result) => {
        if (err) throw err
        console.log(result)
    })
}