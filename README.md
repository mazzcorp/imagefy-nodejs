# imagefy-nodejs
> api client for node js based on axios

### Features
- Lossless and Lossy compression for jpg and png
- Adaptive resizing with different action modes
- Thumbnail creation
- Watermark creation
- QR Code creation

### How to install?
~~~
npm i imagefy
~~~

### Getting started
~~~javascript
import Imagefy from 'imagefy'

const imagefy = new Imagefy('MY_API_KEY')
const image = await imagefy.losslessCompress('/path/to/pic')

await image.save('result.jpg')
~~~

### For more information
See the [official website](https://mazzcorp.com.br/) to create an account, get your __api key__, see the __docs__ and other managements.\
You can also access the Swagger by [clicking here](https://imagefy.mazzcorp.com.br/docs).
