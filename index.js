import axios from "axios"

const baseUrl = "https://imagefy.mazzcorp.com.br/api/v1"
const isHexColor = /^#(?:[a-f0-9]{3}){1,2}$/i
const isSize = /^\d{1,3}x\d{1,3}$/

class ImagefyResult {

}

export default class Imagefy {
    constructor(key) {
        this.key = key
    }

    async createAbbreviation({ background, foreground, name, size }) {
        if (!isHexColor.test(background))
            throw 'background must be a hex string color'
        if (!isHexColor.test(foreground))
            throw 'foreground must be a hex string color'
        if (!name || typeof name != 'string')
            throw 'name must be a string'
        if (name.length > 100)
            throw 'name must be less than 100 letters'
        if (!isSize.test(size))
            throw 'size must be a 999x999 string'

        const endPoint = "generate/abbreviation"
        const data = JSON.stringify({ background, foreground, name, size })
        const response = await axios.post(`${baseUrl}/${endPoint}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': this.key
            }
        })

        if (response.status != 200)
            throw 'Try again later'
        else
            return new ImagefyResult(response.data)
    }
}