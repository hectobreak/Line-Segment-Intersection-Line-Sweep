/* Priority queue implementation */
Array.prototype.heapify = function(m, i, cfunction = (a, b) => a - b){
	let largest = i;
	let l = (i << 1) + 1, r = (i << 1) + 2;
	if(l < m && cfunction(this[l], this[largest]) < 0)
		largest = l;
	if(r < m && cfunction(this[r], this[largest]) < 0)
		largest = r;
	if(largest !== i){
		[ this[i], this[largest] ] = [ this[largest], this[i] ];
		this.heapify(m, largest, cfunction);
	}
}

Array.prototype.addWithPriority = function(x, cfunction = (a, b) => a - b){
	let dad = (k) => (k - 1) >> 1;
	this.push(x);
	let i = this.length - 1;
	while( i > 0 && cfunction( this[dad(i)], this[i] ) > 0 ){
		[ this[dad(i)], this[i] ] = [ this[i], this[dad(i)] ];
		i = dad(i);
	}
}

Array.prototype.popWithPriority = function(cfunction = (a, b) => a - b, repeats = true){
	let ret = this[0];
	this[0] = this[this.length - 1];
	this.pop();
	this.heapify(this.length, 0, cfunction);
	return ret;
}

Array.prototype.makeHeap = function( cfunction = (a, b) => a - b ){
	for(let i = (this.length >> 1) - 1; i >= 0; --i){
		this.heapify( this.length, i, cfunction);
	}
}

Array.prototype.isHeap = function( cfunction = (a, b) => a - b ){
	for(let i = (this.length >> 1) - 1; i >= 0; --i){
		if( cfunction( this[i], this[(i << 1) + 1] ) > 0 ) return false;
		if( (i << 1) + 2 < this.length && cfunction( this[i], this[(i << 1) + 2] ) > 0 ) return false;
	}
	return true;
}
