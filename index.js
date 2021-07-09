import axios from "axios"
import FormData from "form-data"
import fs from "fs"

const baseUrl = "https://imagefy.mazzcorp.net/api/v1"
const isHexColor = /^#(?:[a-f0-9]{3}){1,2}$/i
const isNormalSize = /^\d{1,3}x\d{1,3}$/
const isLargeSize = /^\d{1,4}x\d{1,4}$/

class ImagefyResult {
    constructor(data) {
        this.buffer = data
    }

    /**
     * 
     * @param {string} path 
     * @returns {Promise<void>}
     */
    save(path) {
        return new Promise((resolve, reject) => {
            const options = { flag: 'w+' }
            fs.writeFile(path, this.buffer, options, err => {
                if(err) reject(err)
                else resolve()
            })
        })
    }

    /**
     * 
     * @returns {Promise<Blob>}
     */
    toBlob() {
        return new Promise((resolve, reject) => {
            try { resolve(new Blob(this.buffer)) } 
            catch (error) { reject(error) }
        })
    }
}

export default class Imagefy {
    /**
     * 
     * @param {string} key 
     * @param {import("axios").AxiosProxyConfig} proxy 
     */
    constructor(key, proxy = undefined) {
        this.key = key
        this.proxy = proxy
    }

    /**
     * 
     * @param {{background: string, foreground: string, name: string, size: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createAbbreviation({ background, foreground, name, size }) {
        if (!isHexColor.test(background)) throw 'background must be a hex string color'
        if (!isHexColor.test(foreground)) throw 'foreground must be a hex string color'
        if (!name || typeof name != 'string') throw 'name must be a string'
        if (name.length > 100) throw 'name must be less than 100 letters'
        if (!isNormalSize.test(size)) throw 'size must be a 999x999 string'

        const endPoint = "generate/abbreviation"
        const data = JSON.stringify({ background, foreground, name, size })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{background: string, foreground: string, text: string, size: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createPlaceholder({ background, foreground, text, size }) {
        if (!isHexColor.test(background)) throw 'background must be a hex string color'
        if (!isHexColor.test(foreground)) throw 'foreground must be a hex string color'
        if (!text || typeof text != 'string') throw 'text must be a string'
        if (text.length > 100) throw 'text must be less than 100 letters'
        if (!isLargeSize.test(size)) throw 'size must be a 999x999 string'

        const endPoint = "generate/placeholder"
        const data = JSON.stringify({ background, foreground, text, size })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{size: number, address: string, amount: number}}
     * @returns {Promise<ImagefyResult>}
     */
    async createBitcoinQrCode({ size, address, amount }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!address || typeof address != 'string') throw 'address must be a string'
        if (typeof amount == 'number' && amount < 0) throw 'address must be greater than 0'

        const endPoint = "generate/qr-code"
        const args = !amount ? [address] : [address, amount + '']
        const data = JSON.stringify({ size, type: 'Bitcoin', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{size: number, url: string, title: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createBookmarkQrCode({ size, url, title }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!url || typeof url != 'string') throw 'url must be a valid string'
        if (!title || typeof title != 'string') throw 'title must be a valid string'
        if (title.length >= 512) throw 'title must be  less than 512 chars'
        if (url.length >= 2048) throw 'url must be less than 2048 chars'


        const endPoint = "generate/qr-code"
        const data = JSON.stringify({ size, type: 'Bookmark', args: [url, title] })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, firstName: string, lastName: string, phone: string, email: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createContactQrCode({ size, firstName, lastName, phone, email = undefined }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        
        if (!firstName || typeof firstName != 'string') throw 'firstName must be a valid string'
        if (firstName.length > 100) throw 'firstName must be less than 100 chars'
        
        if (!lastName || typeof lastName != 'string') throw 'lastName must be a valid string'
        if (lastName.length > 100) throw 'lastName must be less than 100 chars'

        if (!phone || typeof phone != 'string') throw 'phone must be a valid string'
        if (phone.length != 14) throw 'phone must be in fomart +5500900000000'
        
        if(!!email) {
            if (typeof email != 'string') throw 'email must be a valid string'
            if (email.length > 100) throw 'email must be less than 100 chars'
        }
        else email = ""

        const endPoint = "generate/qr-code"
        const args = [firstName, lastName, phone, email]
        const data = JSON.stringify({ size, type: 'Contact', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, subject: string, description: string, location: string, startAt: Date, endAt: Date}}
     * @returns {Promise<ImagefyResult>}
     */
    async createEventQrCode({ size, subject, description, location, startAt, endAt }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'

        if (!subject || typeof subject != 'string') throw 'subject must be a valid string'
        if (subject.length > 100) throw 'subject must be less than 100 chars'
        
        if (!description || typeof description != 'string') throw 'description must be a valid string'
        if (description.length > 200) throw 'description must be less than 200 chars'
        
        if (!location || typeof location != 'string') throw 'location must be a valid string'
        if (location.length > 100) throw 'location must be less than 100 chars'
        
        startAt = Date.parse(startAt)
        if (isNaN(startAt)) throw 'startAt must be a valid date'
        startAt = new Date(startAt)
        
        endAt = Date.parse(endAt)
        if (isNaN(endAt)) throw 'endAt must be a valid date'
        endAt = new Date(endAt)

        if(startAt > endAt) throw 'startAt must be less than endAt'

        const endPoint = "generate/qr-code"
        const args = [subject, description, location, startAt.toISOString(), endAt.toISOString()]
        const data = JSON.stringify({ size, type: 'Event', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, latitude: number, longitude: number}}
     * @returns {Promise<ImagefyResult>}
     */
    async createGeolocationQrCode({ size, latitude, longitude }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!latitude || typeof latitude != 'number') throw 'latitude must be a valid number'
        if (!longitude || typeof longitude != 'number') throw 'longitude must be a valid number'

        const endPoint = "generate/qr-code"
        const args = [latitude + '', longitude + '']
        const data = JSON.stringify({ size, type: 'Geolocation', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, email: string, subject: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createMailQrCode({ size, email, subject }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!email || typeof email != 'string') throw 'email must be a valid string'
        if (email.length > 100) throw 'email must be less than 100 chars'
        if (!subject || typeof subject != 'string') throw 'subject must be a valid string'
        if (subject.length >= 100) throw 'subject must be less than 100 chars'

        const endPoint = "generate/qr-code"
        const args = [email, subject]
        const data = JSON.stringify({ size, type: 'Mail', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, address: string, amount: number}}
     * @returns {Promise<ImagefyResult>}
     */
    async createMoneroQrCode({ size, address, amount }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!address || typeof address != 'string') throw 'address must be a string'
        if (typeof amount == 'number' && amount < 0) throw 'address must be greater than 0'

        const endPoint = "generate/qr-code"
        const args = !amount ? [address] : [address, amount + '']
        const data = JSON.stringify({ size, type: 'Monero', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, phone: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createPhoneCallQrCode({ size, phone }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!phone || typeof phone != 'string') throw 'phone must be a valid string'
        if (phone.length != 14) throw 'phone must be in format +5500900000000'

        const endPoint = "generate/qr-code"
        const args = [phone]
        const data = JSON.stringify({ size, type: 'PhoneCall', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, username: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createSkypeCallQrCode({ size, username }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!username || typeof username != 'string') throw 'username must be a valid string'
        if (username.length > 113) throw 'username must be less than 113 chars'

        const endPoint = "generate/qr-code"
        const args = [username]
        const data = JSON.stringify({ size, type: 'SkypeCall', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, phone: string, subject: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createSmsQrCode({ size, phone, subject }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!phone || typeof phone != 'string') throw 'phone must be a valid string'
        if (phone.length != 14) throw 'phone must be in format +5500900000000'
        if (!subject || typeof subject != 'string') throw 'subject must be a valid string'
        if (subject.length >= 120) throw 'subject must be less than 120 chars'

        const endPoint = "generate/qr-code"
        const args = [phone, subject]
        const data = JSON.stringify({ size, type: 'Sms', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, text: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createTextQrCode({ size, text }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!text || typeof text != 'string') throw 'text must be a valid string'
        if (text.length > 300) throw 'text must be  less than 300 chars'

        const endPoint = "generate/qr-code"
        const data = JSON.stringify({ size, type: 'Text', args: [text] })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, url: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createUrlQrCode({ size, url }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!url || typeof url != 'string') throw 'url must be a valid string'
        if (url.length >= 2048) throw 'url must be  less than 2048 chars'

        const endPoint = "generate/qr-code"
        const data = JSON.stringify({ size, type: 'Url', args: [url] })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{size: number, phone: string, message: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async createWhatsappQrCode({ size, phone, message }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!phone || typeof phone != 'string') throw 'phone must be a valid string'
        if (!message || typeof message != 'string') throw 'message must be a valid string'
        if (phone.length != 14) throw 'phone must be in format +5500900000000'
        if (message.length > 300) throw 'message must be less than 300 chars'

        const endPoint = "generate/qr-code"
        const args = [phone, message]
        const data = JSON.stringify({ size, type: 'Whatsapp', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {{size: number, ssid: string, password: string, isHidden: boolean}}
     * @returns {Promise<ImagefyResult>}
     */
    async createWifiQrCode({ size, ssid, password, isHidden = false }) {
        if (typeof size != 'number') throw 'size must be a number'
        if (size < 100 || size > 9999) throw 'size must between 100 and 9999'
        if (!ssid || typeof ssid != 'string') throw 'ssid must be a valid string'
        if (!password || typeof password != 'string') throw 'password must be a valid string'
        if (ssid.length >= 100) throw 'ssid must be  less than 100 chars'
        if (password.length >= 100) throw 'password must be less than 100 chars'
        if (typeof isHidden != 'boolean') throw 'isHidden must be a boolean'

        const endPoint = "generate/qr-code"
        const args = [ssid, password, isHidden + '']
        const data = JSON.stringify({ size, type: 'Wifi', args })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            responseType: 'arraybuffer',
            proxy: this.proxy,
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
    
    /**
     * 
     * @param {string} path 
     * @param {boolean} preserve 
     * @returns {Promise<ImagefyResult>}
     */
    async losslessCompress(path, preserve = false) {
        const form = new FormData()
        form.append('preserve', (!!preserve) + '')
        form.append('source', fs.createReadStream(path))

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/compress/lossless`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{path: string, quality: number, blur: number, preserve: boolean}}
     * @returns {Promise<ImagefyResult>}
     */
     async lossyCompress({path, quality, blur, preserve = false}) {
        if (typeof path != 'string') throw 'path must be a string'
        if (typeof quality != 'number') throw 'quality must be a number'
        if (typeof blur != 'number') throw 'blur must be a number'

        if (quality < 1 || quality > 100) throw 'quality must between 1 and 100'
        if (blur < 1 || blur > 100) throw 'blur must between 1 and 100'
        if (!path) throw 'path must be a valid string'

        const form = new FormData()
        form.append('blur', blur)
        form.append('quality', quality)
        form.append('preserve', (!!preserve) + '')
        form.append('source', fs.createReadStream(path))

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/compress/lossy`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{path: string, size: string, ignoreAspectRatio: boolean}}
     * @returns {Promise<ImagefyResult>}
     */
    async resizeFit({path, size, ignoreAspectRatio = false}) {
        if (typeof path != 'string') throw 'path must be a string'
        if (typeof size != 'string') throw 'size must be a string'
        if (!isNormalSize.test(size)) throw 'size must be a 999x999 string'

        const form = new FormData()
        form.append('size', size + '')
        form.append('source', fs.createReadStream(path))
        form.append('ignoreAspectRatio', (!!ignoreAspectRatio) + '')

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/resize/fit`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{path: string, size: string, mode: ('cover'|'contain')?, background: string?}}
     * @returns {Promise<ImagefyResult>}
     */
    async resizeFill({path, size, mode = 'cover', background = '#fff'}) {
        if (typeof path != 'string') throw 'path must be a string'
        if (typeof size != 'string') throw 'size must be a string'
        if (typeof mode != 'string') throw 'mode must be a string'
        if (typeof background != 'string') throw 'background must be a string'

        mode = mode.toLocaleLowerCase()
        if (!isNormalSize.test(size)) throw 'size must be a 999x999 string'
        if (!isHexColor.test(background)) throw 'background must be a hex string color'
        if (!['cover', 'contain'].includes(mode)) throw 'mode must be cover or contain'

        const form = new FormData()
        form.append('size', size)
        form.append('mode', mode)
        form.append('background', background)
        form.append('source', fs.createReadStream(path))

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/resize/fill`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{path: string, size: string}}
     * @returns {Promise<ImagefyResult>}
     */
    async thumbnailCropped({path, size}) {
        if (typeof path != 'string') throw 'path must be a string'
        if (typeof size != 'string') throw 'size must be a string'
        if (!isNormalSize.test(size)) throw 'size must be a 999x999 string'

        const form = new FormData()
        form.append('size', size)
        form.append('source', fs.createReadStream(path))

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/thumbnail/cropped`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{path: string, size: string, blur: number, circle: boolean}}
     * @returns {Promise<ImagefyResult>}
     */
    async thumbnailBlurred({path, size, blur = 20, circle = false}) {
        if (typeof path != 'string') throw 'path must be a string'
        if (typeof size != 'string') throw 'size must be a string'
        if (typeof blur != 'number') throw 'blur must be a number'
        if (!isNormalSize.test(size)) throw 'size must be a 999x999 string'
        if(blur < 1 || blur > 100) throw 'blur must between 1 and 100'

        const form = new FormData()
        form.append('size', size + '')
        form.append('blur', blur + '')
        form.append('circle', (!!circle) + '')
        form.append('source', fs.createReadStream(path))

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/thumbnail/blurred`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }

    /**
     * 
     * @param {{
     *  background: string, 
     *  foreground: string, 
     *  position: ("northwest"|"north"|"northeast"|"west"|"center"|"east"|"southwest"|"south"|"southeast")?, 
     *  grayscale: boolean?, 
     *  opacity: number?, 
     *  scale: number?}}
     * @returns {Promise<ImagefyResult>}
     */
    async watermark({background, foreground, position = 'center', grayscale = false, opacity = 75, scale = 50}) {
        if (typeof background != 'string') throw 'background must be a string'
        if (typeof foreground != 'string') throw 'foreground must be a string'
        if (typeof position != 'string') throw 'position must be a string'
        if (typeof opacity != 'number') throw 'opacity must be a number'
        if (typeof scale != 'number') throw 'scale must be a number'

        position = position.toLocaleLowerCase()
        if(opacity < 1 || opacity > 100) throw 'opacity must between 1 and 100'
        if(scale < 1 || scale > 100) throw 'scale must between 1 and 100'
        if (!["northwest","north","northeast","west","center","east","southwest","south","southeast"].includes(position)) throw 'position has a invalid value'

        const form = new FormData()
        form.append('position', position)
        form.append('scale', scale + '')
        form.append('opacity', opacity + '')
        form.append('grayscale', (!!grayscale) + '')
        form.append('background', fs.createReadStream(background))
        form.append('foreground', fs.createReadStream(foreground))

        const response = await axios({
            method: 'post',
            data: form,
            responseType: 'arraybuffer',
            proxy: this.proxy,
            url: `${baseUrl}/watermark`,
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200) throw 'Try again later'
        else return new ImagefyResult(response.data)
    }
}