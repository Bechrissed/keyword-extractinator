# Keyword Extractinator

Library for extracting keywords. Currently a work in progress, adding new methods soon. Currently available keyword and keyphrase extraction techniques are:

- Graph-based methods:
  - PageRank ([https://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf](https://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf))

## Examples

All results are done using following text:

```
"""No, you clearly don't know who you're talking to, so let me clue you in. 
I am not in danger, Skyler. I AM the danger! A guy opens his door and 
gets shot and you think that of me? No. I am the one who knocks!"""
```

### Graph Based Methods

PageRank:
```js
[ { word: 'am', value: 1.3069444444444445 },
  { word: 'danger', value: 1.3069444444444445 },
  { word: 'talking', value: 1.1900458333333335 },
  { word: 'gets', value: 1.1900458333333335 },
  { word: 'you\'re', value: 1.1900458333333335 },
  { word: 'door', value: 1.1900458333333335 },
  { word: 'Skyler', value: 1.1180555555555554 },
  { word: 'let', value: 1.0044979166666668 },
  { word: 'shot', value: 1.0044979166666668 },
  { word: 'opens', value: 1.0044979166666665 } ]
```

## Usage

### Graph Based Methods

PageRank:

```js
const keyword_extractinator = require('keyword_extractinator');
const content = //some content
const results = keyword_extractinator.pageRank.top(content, 10);
```

## Install

Just download and require it locally

## License
[MIT](https://choosealicense.com/licenses/mit/)