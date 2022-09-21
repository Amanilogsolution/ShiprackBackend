const express = require('express')
const app = express()
const port = 3007
const bodyParser = require('body-parser')
const { default: axios } = require("axios")
const cors = require('cors')
const sqlConfig = require('./config.js')
const sql = require('mssql')
const schedule = require('node-schedule')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const job = schedule.scheduleJob(' 1 59 * * * * ', async function (req, res) {
    try {
        axios.get(`https://track.shiprec.io/api/packages/track?token=2343677044130299252`)
            .then(response => { const data = response.data; abc(data, 'GGN-TRK3') })
            .catch(error => console.log(error))

        axios.get(`https://track.shiprec.io/api/packages/track?token=1166436752619174963`)
            .then(response => { const data = response.data; abc(data, 'GGN-TRK1') })
            .catch(error => console.log(error))

        axios.get(`https://track.shiprec.io/api/packages/track?token=7858141599707738327`)
            .then(response => { const data = response.data; abc(data, 'GGN-TRK2') })
            .catch(error => console.log(error))
    }
    catch (err) {
        console.log(err)
    }
})




const abc = async (data, id) => {
    await sql.connect(sqlConfig)
    console.log(data)

    data.map((item) => {
        var utcSeconds = item.timestamp;
        var d = new Date(0) 
        d.setUTCSeconds(utcSeconds);
        const result = sql.query(`insert into SHIPREC.dbo.tbl_shiprec (id,lat,long,times,temp)
        values('${id}','${item.lat}','${item.long}','${d}','')`)

    })
    data.map((item, i, arr) => {
        console.log(i)
        if (i === 0) {
            var utcSeconds = item.timestamp;
            var d = new Date(0) 
            d.setUTCSeconds(utcSeconds);
            const result1 = sql.query(`update SHIPREC.dbo.shiprec_master set lat='${item.lat}',long='${item.long}',times='${d}',temp='',last_rec=getdate() where device_id='${id}'`)
        }
    })
}

app.post('/getdata',async function(req, res) {
    const id = req.body.id;
    try {
        await sql.connect(sqlConfig)
        const result = await sql.query(`select lat,long from  SHIPREC.dbo.shiprec_master where device_id='${id}'`)
        res.send(result.recordset[0])
    } catch (err) {
        res.send(err)
    }


})



app.listen(port, (err, req, res, next) => {
    if (err)
        console.log("Ouch! Something went wrong")
    console.log(`server listen on: ${port}`)
})