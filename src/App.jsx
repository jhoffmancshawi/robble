import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {

    const [writer, setWriter] = useState()
    const [reader, setReader] = useState()

    const colorPicker = useRef()

    useEffect(() => {
        reader?.then( r => {
            console.log('a')
            r.addEventListener(
                'characteristicvaluechanged',
                (event) => {
                   console.log(event) 
                }
            )
        })
    }, [reader])

    async function handleConnect() {
        navigator.bluetooth.requestDevice({ 
            filters: [{ namePrefix: 'Makeblock' }],
            optionalServices: ['0000ffe1-0000-1000-8000-00805f9b34fb']
        })
        .then(device => { 
            console.log(device.name)

            return device.gatt.connect()
        })
        .then(server => server.getPrimaryService('0000ffe1-0000-1000-8000-00805f9b34fb'))
        .then(service => {
            setWriter(service.getCharacteristic('0000ffe3-0000-1000-8000-00805f9b34fb'))
            setReader(service.getCharacteristic('0000ffe2-0000-1000-8000-00805f9b34fb'))
        })
        .catch(error => { console.error(error) })
    }

    function send(command = 'b') {
        const header = [0xFF, 0x55]
        const bytes = command.split('').map(c => c.charCodeAt())
        const payload = new Uint8Array([...header, ...bytes]);

        writer
        .then(w => w.writeValue(payload))
        .catch(error => { console.error(error) })
    }


    function handleBeep() {
        send('b')
    }

    function hexToRgb(hex) {
        // Supprime le symbole '#' s'il est présent
        hex = hex.replace("#", "");
        // Convertit les valeurs hexadécimales en entiers RGB
        return [
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16)
        ];
    }

    function handleColor() {
        // const command = 'l,200,33,33'.split('').map(c => c.charCodeAt()).toString(16)
        console.log(colorPicker.current.value)
        const rgb = hexToRgb(colorPicker.current.value)

        console.log(`l,${rgb.join(',')}`)
        send(`l,${rgb.join(',')}`)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' , alignItems: 'center', gap: '24px'}}>
            <img src="https://shawinigan.info/img/header-logo.png" style={{ width: '80%' }}/> 

            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
              <h1>Démonstration</h1>        
              <h2 style={{ marginTop: '-1rem' }} >Robotique | Web | Communication BLE</h2>        
            </div>

            <button onClick={ handleConnect }>Connecter</button>

            <button onClick={ handleBeep }>Beep</button>

            <div style={{ display: 'flex', gap: '16px' }}>
                <input type="color" ref={colorPicker} />
                <button onClick={ handleColor }>Color</button>
            </div>
        </div>
    )
    
}

export default App
