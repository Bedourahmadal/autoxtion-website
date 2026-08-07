/*
 * A QR encoder, in the page.
 *
 * Every hosted QR service — Google Charts, api.qrserver.com and the rest — works by receiving the
 * text and sending back a picture. For this page the text is a visitor's name, employee number and
 * two email addresses, so using one would mean posting the personal details of everybody who walks
 * past the stand to a third party, to draw a square. That is not a trade worth making for a
 * hundred lines of arithmetic.
 *
 * Byte mode and error-correction level M only, which is all this needs: byte mode carries UTF-8 so
 * Arabic names encode directly, and M tolerates about 15% of the code being obscured — a fingerprint
 * on a phone screen, or a hand covering a corner.
 *
 * Public-domain algorithm (ISO/IEC 18004). Implemented here rather than pulled in so the page has
 * no dependency that can be unreachable in an exhibition hall.
 */
(function (global) {
  'use strict';

  // Error-correction codewords per block, and how many blocks, for level M at each version.
  // Straight from the standard's tables; the index is the version.
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26];
  var BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];

  // Where the alignment squares sit, per version. Version 1 has none.
  var ALIGNMENT = [
    [], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62],
    [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82],
    [6, 30, 58, 86], [6, 34, 62, 90]
  ];

  function bytesOf(text) {
    var utf8 = unescape(encodeURIComponent(text));
    var out = [];
    for (var i = 0; i < utf8.length; i++) out.push(utf8.charCodeAt(i));
    return out;
  }

  function totalCodewords(version) {
    var size = version * 4 + 17;
    var modules = size * size;

    modules -= 3 * 64;                                    // three finder patterns and separators
    modules -= (size - 16) * 2;                           // timing patterns
    modules -= 31;                                        // format information and the dark module

    var aligns = ALIGNMENT[version].length;
    if (aligns > 0) {
      modules -= (aligns * aligns - 3) * 25;              // alignment squares, minus the three corners
      modules += (aligns - 2) * 10;                       // where they overlap the timing patterns
    }

    if (version >= 7) modules -= 36;                      // version information

    return Math.floor(modules / 8);
  }

  function capacity(version) {
    var total = totalCodewords(version);
    var ecc = ECC_PER_BLOCK[version] * BLOCKS[version];
    var header = version < 10 ? 2 : 3;                    // mode indicator plus length field
    return total - ecc - header;
  }

  function pickVersion(length) {
    for (var v = 1; v <= 20; v++) {
      if (capacity(v) >= length) return v;
    }
    throw new Error('too much text for one code');
  }

  // ---- Galois field arithmetic, for the error correction ----------------------------------

  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function multiply(a, b) {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
  }

  function generator(degree) {
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= multiply(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }

  function remainder(data, degree) {
    var gen = generator(degree);
    var result = new Array(degree).fill(0);

    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ result[0];
      result.shift();
      result.push(0);
      for (var j = 0; j < degree; j++) result[j] ^= multiply(gen[j + 1], factor);
    }

    return result;
  }

  // ---- Bit stream -------------------------------------------------------------------------

  function encode(text) {
    var data = bytesOf(text);
    var version = pickVersion(data.length);
    var bits = [];

    function push(value, length) {
      for (var i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    }

    push(4, 4);                                           // byte mode
    push(data.length, version < 10 ? 8 : 16);
    for (var i = 0; i < data.length; i++) push(data[i], 8);

    var total = totalCodewords(version);
    var eccTotal = ECC_PER_BLOCK[version] * BLOCKS[version];
    var dataCodewords = total - eccTotal;

    push(0, Math.min(4, dataCodewords * 8 - bits.length));   // terminator
    while (bits.length % 8 !== 0) bits.push(0);

    var words = [];
    for (var b = 0; b < bits.length; b += 8) {
      var value = 0;
      for (var k = 0; k < 8; k++) value = (value << 1) | bits[b + k];
      words.push(value);
    }

    // Pad alternately with the two bytes the standard names, until the block is full.
    for (var pad = 0; words.length < dataCodewords; pad++) {
      words.push(pad % 2 === 0 ? 0xEC : 0x11);
    }

    return { version: version, words: words, dataCodewords: dataCodewords };
  }

  /// Splits the data into blocks, gives each its own error correction, then interleaves them —
  /// which is what lets a code survive damage in one place rather than losing one whole block.
  function interleave(encoded) {
    var version = encoded.version;
    var blocks = BLOCKS[version];
    var eccLength = ECC_PER_BLOCK[version];
    var shortLength = Math.floor(encoded.dataCodewords / blocks);
    var longBlocks = encoded.dataCodewords % blocks;

    var dataBlocks = [], eccBlocks = [], offset = 0;

    for (var i = 0; i < blocks; i++) {
      var length = shortLength + (i >= blocks - longBlocks ? 1 : 0);
      var block = encoded.words.slice(offset, offset + length);
      offset += length;
      dataBlocks.push(block);
      eccBlocks.push(remainder(block, eccLength));
    }

    var out = [];
    var longest = shortLength + (longBlocks > 0 ? 1 : 0);

    for (var c = 0; c < longest; c++) {
      for (var d = 0; d < blocks; d++) {
        if (c < dataBlocks[d].length) out.push(dataBlocks[d][c]);
      }
    }

    for (var e = 0; e < eccLength; e++) {
      for (var f = 0; f < blocks; f++) out.push(eccBlocks[f][e]);
    }

    return out;
  }

  // ---- Matrix -----------------------------------------------------------------------------

  function build(text) {
    var encoded = encode(text);
    var codewords = interleave(encoded);
    var version = encoded.version;
    var size = version * 4 + 17;

    var grid = [], reserved = [];
    for (var r = 0; r < size; r++) {
      grid.push(new Array(size).fill(0));
      reserved.push(new Array(size).fill(false));
    }

    function finder(row, col) {
      for (var dr = -1; dr <= 7; dr++) {
        for (var dc = -1; dc <= 7; dc++) {
          var rr = row + dr, cc = col + dc;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          var edge = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
          grid[rr][cc] = (edge !== 2 && edge !== 4) ? 1 : 0;
          reserved[rr][cc] = true;
        }
      }
    }

    finder(0, 0);
    finder(0, size - 7);
    finder(size - 7, 0);

    for (var t = 8; t < size - 8; t++) {
      grid[6][t] = grid[t][6] = t % 2 === 0 ? 1 : 0;
      reserved[6][t] = reserved[t][6] = true;
    }

    var centres = ALIGNMENT[version];
    for (var a = 0; a < centres.length; a++) {
      for (var b = 0; b < centres.length; b++) {
        var ar = centres[a], ac = centres[b];
        if ((ar === 6 && ac === 6) || (ar === 6 && ac === size - 7) || (ar === size - 7 && ac === 6)) continue;

        for (var mr = -2; mr <= 2; mr++) {
          for (var mc = -2; mc <= 2; mc++) {
            grid[ar + mr][ac + mc] = Math.max(Math.abs(mr), Math.abs(mc)) !== 1 ? 1 : 0;
            reserved[ar + mr][ac + mc] = true;
          }
        }
      }
    }

    // Reserve the format strip and, on larger codes, the version blocks.
    for (var i = 0; i < 9; i++) {
      reserved[8][i] = reserved[i][8] = true;
      if (size - 1 - i >= 0) reserved[8][size - 1 - i] = reserved[size - 1 - i][8] = true;
    }
    grid[size - 8][8] = 1;
    reserved[size - 8][8] = true;

    if (version >= 7) {
      for (var v = 0; v < 18; v++) {
        var vr = Math.floor(v / 3), vc = v % 3;
        reserved[size - 11 + vc][vr] = reserved[vr][size - 11 + vc] = true;
      }
    }

    // Data, laid in a zigzag from the bottom right, skipping the timing column.
    var bit = 0, upward = true;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (var step = 0; step < size; step++) {
        var row = upward ? size - 1 - step : step;
        for (var side = 0; side < 2; side++) {
          var c = col - side;
          if (reserved[row][c]) continue;
          var value = 0;
          if (bit < codewords.length * 8) {
            value = (codewords[bit >>> 3] >>> (7 - (bit & 7))) & 1;
          }
          grid[row][c] = value;
          bit++;
        }
      }
      upward = !upward;
    }

    return { grid: grid, reserved: reserved, size: size, version: version };
  }

  function maskBit(mask, row, col) {
    switch (mask) {
      case 0: return (row + col) % 2 === 0;
      case 1: return row % 2 === 0;
      case 2: return col % 3 === 0;
      case 3: return (row + col) % 3 === 0;
      case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
      case 5: return (row * col) % 2 + (row * col) % 3 === 0;
      case 6: return ((row * col) % 2 + (row * col) % 3) % 2 === 0;
      default: return ((row + col) % 2 + (row * col) % 3) % 2 === 0;
    }
  }

  function formatBits(mask) {
    var data = (0x00 << 3) | mask;                        // 0b00 is error-correction level M
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }

  function penalty(grid, size) {
    var score = 0;

    for (var r = 0; r < size; r++) {
      for (var direction = 0; direction < 2; direction++) {
        var run = 1;
        for (var c = 1; c < size; c++) {
          var a = direction === 0 ? grid[r][c] : grid[c][r];
          var b = direction === 0 ? grid[r][c - 1] : grid[c - 1][r];
          if (a === b) { run++; if (run === 5) score += 3; else if (run > 5) score++; }
          else run = 1;
        }
      }
    }

    for (var br = 0; br < size - 1; br++) {
      for (var bc = 0; bc < size - 1; bc++) {
        var v = grid[br][bc];
        if (v === grid[br][bc + 1] && v === grid[br + 1][bc] && v === grid[br + 1][bc + 1]) score += 3;
      }
    }

    var dark = 0;
    for (var dr = 0; dr < size; dr++) for (var dc = 0; dc < size; dc++) dark += grid[dr][dc];
    var ratio = Math.abs(dark * 100 / (size * size) - 50);
    score += Math.floor(ratio / 5) * 10;

    return score;
  }

  /// Applies each of the eight masks, scores them by the standard's penalty rules, and keeps the
  /// one a scanner will find easiest — patterns that look like finder squares, or large blocks of
  /// one colour, are what confuse a camera.
  function apply(built) {
    var best = null, bestScore = Infinity, bestMask = 0;

    for (var mask = 0; mask < 8; mask++) {
      var trial = built.grid.map(function (row) { return row.slice(); });

      for (var r = 0; r < built.size; r++) {
        for (var c = 0; c < built.size; c++) {
          if (!built.reserved[r][c] && maskBit(mask, r, c)) trial[r][c] ^= 1;
        }
      }

      writeFormat(trial, built.size, mask);

      var score = penalty(trial, built.size);
      if (score < bestScore) { bestScore = score; best = trial; bestMask = mask; }
    }

    if (built.version >= 7) writeVersion(best, built.size, built.version);
    return best;
  }

  function writeFormat(grid, size, mask) {
    var bits = formatBits(mask);

    for (var i = 0; i < 15; i++) {
      var bit = (bits >>> i) & 1;
      if (i < 6) grid[i][8] = bit;
      else if (i === 6) grid[7][8] = bit;
      else if (i === 7) grid[8][8] = bit;
      else if (i === 8) grid[8][7] = bit;
      else grid[8][14 - i] = bit;

      if (i < 8) grid[8][size - 1 - i] = bit;
      else grid[size - 15 + i][8] = bit;
    }

    grid[size - 8][8] = 1;
  }

  function writeVersion(grid, size, version) {
    var rem = version;
    for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    var bits = (version << 12) | rem;

    for (var j = 0; j < 18; j++) {
      var bit = (bits >>> j) & 1;
      var r = Math.floor(j / 3), c = j % 3;
      grid[size - 11 + c][r] = bit;
      grid[r][size - 11 + c] = bit;
    }
  }

  /// Draws onto a canvas. The quiet border is not optional — a code without four modules of blank
  /// around it is one most phone cameras will refuse to see.
  global.drawQr = function (canvas, text, pixel) {
    var built = build(text);
    var grid = apply(built);
    var size = built.size;
    var quiet = 4;
    var scale = pixel || 8;

    canvas.width = canvas.height = (size + quiet * 2) * scale;

    var context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#0f1a19';

    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (grid[r][c]) {
          context.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }

    return built.version;
  };
})(window);
