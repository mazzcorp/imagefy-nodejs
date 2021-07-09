# imagefy-nodejs
> api client for node js based on axios\
Wait, why an API client? Easy, because in cloud development scenarios, costs are calculated by using resources such as CPU, memory and disk.\
By abstracting costly work to an external server, you save real money, but, increase workflow latency in a few milliseconds, consider this if you make multiple calls in sequence.

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
- Firstly, you need to create a free account, go to the [developer dashboard](https://developers.mazzcorp.net/) to do this
- Then, copy your API key and paste into the code

~~~javascript
import Imagefy from 'imagefy'

const imagefy = new Imagefy('MY_API_KEY')
const image = await imagefy.losslessCompress('/path/to/pic')

await image.save('result.jpg')
~~~

### For more information
For more examples like __resizing__, __thumbnails__, __watermark__ or __qr-codes__, see the [official website](https://mazzcorp.net/)\
For documentation with methods names, return types, arguments and descriptions, see [this link](https://mazzcorp.net/#/docs/imagefy/nodejs)\
You can also access the Swagger by [clicking here](https://imagefy.mazzcorp.net/docs)