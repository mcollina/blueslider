BlueSlider
==========

Turn your slides using a [TI SensorTag](http://www.ti.com/ww/it/wireless_connectivity/sensortag/index.shtml?DCMP=PPC_Google_TI&k_clickid=0b13b7bf-a055-c929-ebb2-00004ba68f44&247SEM=) or a [TI SensorTag 2](http://www.ti.com/tool/cc2650stk) on Mac OS X.

Install
-------

```
$ npm install blueslider -g
```

Usage
-----

1. Launch: `$ blueslider`
2. If your SensorTag is not automatically found, press the
   side button.
3. Your SensorTag is discovered.
4. Press the right and/or left button to turn your slides!
5. Have fun :)

Command line options
--------------------

```
Use your TI SensorTag to control your mac.
Usage: node ./index.js --verbose --left-key [key1] --right-key [key] --mouse --acc-period [period] --mouse-sensitivity [sensitivity]

Options:
  -v, --verbose            verbose output
  -l, --left-key           press [key] using the left button. [default: 123]
  -r, --right-key          press [key] using the right button. [default: 124]
  -m, --mouse              enable mouse support
  -a, --acc-period         accelerometer measurement update period in ms [default: 50]
  -s, --mouse-sensitivity  mouse sensitivity [default: 200]
  -h, --help               print this help
```

### Example Output

```
$ node index.js
  blue searching for a sensor tag +0ms
  blue discovered +68ms fb94b8dde3ab42d590f32f58d6fab5dc
  blue connected +552ms
  blue discovered all characteristics +20ms
  blue notify correctly setted up +288ms
  blue right pressed +1s
  blue left pressed +742ms
  blue right pressed +822ms
```

Sometimes the discovery gets stuck before the 'notify correctly setted up' message.
In that case, kill and restart.

License
-------

Copyright (c) 2014 Matteo Collina (http://matteocollina.com)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
