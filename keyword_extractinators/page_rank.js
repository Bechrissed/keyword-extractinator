var posTagger = require("wink-pos-tagger");
var math = require("mathjs");
var stopWords = require("./stopwords");

const sentenceSplitter = (content) => {
  //console.log(`Splitting content into different sentences`);

  //regex for splitting content
  let splitContent = content.match(/[^\.!\?]+[\.!\?]+/g);
  try {
    splitContent = splitContent.map((sent) => {
      return sent.trim();
    });
    return splitContent;
  } catch (e) {
    if (e instanceof TypeError) {
      return [content];
    } else {
      throw e;
    }
  }
};

const posSentence = (sentences) => {
  //og(`POS Tagging of the sentences`);

  //uses wink pos tagger: https://winkjs.org/wink-pos-tagger/
  //93.2% accuracy at 525k wps
  const tags = [
    "VBP",
    "VBZ",
    "NN",
    "VB",
    "VBG",
    "VBN",
    "NNS",
    "VBD",
    "NNP",
    "NNPS",
  ];
  var tagger = posTagger();
  var posTaggedSentences = sentences.map((sentence) => {
    var tagged = tagger.tagSentence(sentence);
    var newSent = [];
    for (var i = 0; i < tagged.length; i++) {
      if (
        tags.includes(tagged[i].pos) &&
        !stopWords.includes(tagged[i].value)
      ) {
        newSent.push(tagged[i].value);
      }
    }
    return newSent;
  });
  return posTaggedSentences;
};

const getVocab = (posSentences) => {
  //console.log(`Getting the vocab`);

  //returns the vocabulary using the pos filtered sentences
  const vocab = [];
  for (var i = 0; i < posSentences.length; i++) {
    for (var j = 0; j < posSentences[i].length; j++) {
      if (!vocab.includes(posSentences[i][j])) {
        vocab.push(posSentences[i][j]);
      }
    }
  }
  return vocab;
};

const getTokenPairs = (sentences, windowSize = 4) => {
  //console.log(`Getting token pairs`);

  //return the token pairs
  const token_pairs = sentences.map((sentence) => {
    var sentenceTokenPairs = [];
    for (var i = 0; i < sentence.length; i++) {
      for (var j = i + 1; j < i + windowSize; j++) {
        if (j >= sentence.length) {
          break;
        }
        let pair = [sentence[i], sentence[j]];
        if (!sentenceTokenPairs.includes(pair)) {
          sentenceTokenPairs.push(pair);
        }
      }
    }
    return sentenceTokenPairs;
  });
  return token_pairs;
};

const zeroes = (dimensions) => {
  //create array of dimensions of zeroes
  var array = [];
  for (var i = 0; i < dimensions[0]; i++) {
    array.push(dimensions.length === 1 ? 0 : zeroes(dimensions.slice(1)));
  }
  return array;
};

const ones = (dimensions) => {
  //create array of dimensions of zeroes
  var array = [];
  for (var i = 0; i < dimensions[0]; i++) {
    array.push(dimensions.length === 1 ? 1 : zeroes(dimensions.slice(1)));
  }
  return array;
};

const transpose = (array) => {
  //transposes array
  var transposeArray = [];
  for (var i = 0; i < array.length; i++) {
    transposeArray.push([]);
  }

  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      transposeArray[j].push(array[i][j]);
    }
  }
  return transposeArray;
};

const diag = (array) => {
  //creates array with diag and zeroes
  var arrayLength = array.length;
  var newArray = zeroes([arrayLength, arrayLength]);

  for (var i = 0; i < arrayLength; i++) {
    newArray[i][i] = array[i][i];
  }
  return newArray;
};

const addMatrix = (matrix1, matrix2) => {
  var newArray = [];
  for (var i = 0; i < matrix1.length; i++) {
    newArray.push([]);
    for (var j = 0; j < matrix1[i].length; j++) {
      newArray[i].push(matrix1[i][j] + matrix2[i][j]);
    }
  }
  return newArray;
};

const subMatrix = (matrix1, matrix2) => {
  var newArray = [];
  for (var i = 0; i < matrix1.length; i++) {
    newArray.push([]);
    for (var j = 0; j < matrix1[i].length; j++) {
      newArray[i].push(matrix1[i][j] - matrix2[i][j]);
    }
  }
  return newArray;
};

const symmetrize = (matrix) => {
  const added = addMatrix(matrix, transpose(matrix));
  const subtracted = subMatrix(added, diag(matrix));
  return subtracted;
};

const normalize = (matrix) => {
  const colCount = matrix[0].length;
  const colZeroes = zeroes([colCount]);

  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      colZeroes[j] += matrix[i][j];
    }
  }

  for (var i = 0; i < matrix.length; i++) {
    for (var j = 0; j < matrix[i].length; j++) {
      matrix[i][j] /= Math.max(colZeroes[j], 1);
    }
  }

  return matrix;
};

const dot = (matrix1, matrix2) => {
  var dotArray = [];
  for (var i = 0; i < matrix1.length; i++) {
    var val = 0;
    for (var j = 0; j < matrix1[i].length; j++) {
      val += matrix1[i][j] * matrix2[j];
    }
    dotArray.push(val);
  }
  return dotArray;
};

const scale = (matrix, scale) => {
  for (var i = 0; i < matrix.length; i++) {
    matrix[i] *= scale;
  }
  return matrix;
};

const addConstant = (matrix, constant) => {
  for (var i = 0; i < matrix.length; i++) {
    matrix[i] += constant;
  }
  return matrix;
};

const sum = (matrix) => {
  var val = 0;
  for (var i = 0; i < matrix.length; i++) {
    val += matrix[i];
  }
  return val;
};

const getMatrix = (vocab, tokenPairs) => {
  //console.log(`Building vocabulary matrix with token pairs`);

  //build the matrix
  var matrix = zeroes([vocab.length, vocab.length]);
  for (var i = 0; i < tokenPairs.length; i++) {
    //iterates through sentences
    for (var j = 0; j < tokenPairs[i].length; j++) {
      //iterates through token pairs of sentence
      let idx1 = vocab.indexOf(tokenPairs[i][j][0]);
      let idx2 = vocab.indexOf(tokenPairs[i][j][1]);
      matrix[idx1][idx2] = 1;
    }
  }

  var symmetricMatrix = symmetrize(matrix);
  var normalizedMatrix = normalize(symmetricMatrix);
  return normalizedMatrix;
};

const pageRankIteration = (
  matrix,
  vocab,
  d = 0.85,
  min_diff = 1e-5,
  steps = 10
) => {
  var pr = ones([vocab.length]);
  var previous_pr = 0;
  for (var i = 0; i < steps; i++) {
    pr = addConstant(scale(dot(matrix, pr), d), 1 - d);
    if (Math.abs(previous_pr, sum(pr))) {
      break;
    } else {
      previous_pr = sum(pr);
    }
  }
  var node_weight = [];
  for (var i = 0; i < vocab.length; i++) {
    node_weight.push({
      word: vocab[i],
      value: pr[i],
    });
  }
  return node_weight;
};

const pageRank = (content) => {
  const sentences = sentenceSplitter(content);
  const posSenctences = posSentence(sentences);
  const vocab = getVocab(posSenctences);
  const tokenPairs = getTokenPairs(posSenctences);
  const matrix = getMatrix(vocab, tokenPairs);
  const node_weight = pageRankIteration(matrix, vocab);
  return node_weight;
};

const getTop = (content, n) => {
  const node_weight = pageRank(content);
  const top = node_weight
    .sort(function (a, b) {
      return a.value < b.value ? 1 : -1;
    })
    .slice(0, n);
  return top;
};

module.exports = {
  sentenceSplitter: sentenceSplitter,
  posSentence: posSentence,
  getVocab: getVocab,
  getTokenPairs: getTokenPairs,
  getMatrix: getMatrix,
  pageRankIteration: pageRankIteration,
  pageRank: pageRank,
  top: getTop,
};
