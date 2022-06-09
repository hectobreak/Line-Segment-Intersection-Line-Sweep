/* Dictionary implementation */
class LineSegmentDictionary {
	constructor(sweepTracker){
		this.tracker = sweepTracker;
		this.tree = null;
		this.size = 0;
	}
	
	compare(ls1, ls2) {
		let mls1 = (ls1[1].y - ls1[0].y)/(ls1[1].x - ls1[0].x);
		let mls2 = (ls2[1].y - ls2[0].y)/(ls2[1].x - ls2[0].x);
		let yls1 = mls1 * this.tracker.t + ls1[1].y - mls1 * ls1[1].x;
		let yls2 = mls2 * this.tracker.t + ls2[1].y - mls2 * ls2[1].x;
		return yls2 > yls1 ? 1 : (yls2 < yls1 ? -1 : (mls2 > mls1 ? 1 : (mls2 < mls1 ? -1 : 0) ) );
	}
	
	lrot(x){
		let y = x.l, z = y.r;
		y.r = x;
		x.l = z;
		y.p = x.p;
		x.p = y;
		if(z !== null) z.p = x;
		return y;
	}
	
	rrot(y){
		let x = y.r, z = x.l;
		x.l = y;
		y.r = z;
		x.p = y.p;
		y.p = x;
		if(z !== null) z.p = y;
		return x;
	}
	
	// Inserts a line segment into the dictionary
	insert(ls, nptr = new Object, node = this.tree){
		if(!( ls instanceof Array )) throw new Error("ls is not a line segment " + JSON.stringify(ls));
		if(ls.length !== 2) throw new Error("Line segments must have 2 points");
		if(ls[0].x === undefined || ls[0].y === undefined) throw new Error("The first element of the ls is not a point");
		if(ls[1].x === undefined || ls[1].y === undefined) throw new Error("The second element of the ls is not a point");
		
		//verifyCorrectness(node, this.tracker);
		if(node === null) {
			node = {priority: Math.random(), value: ls, l: null, r: null, p: null};
			nptr.ptr = node;
			this.size++;
			if(this.tree === null) this.tree = node;
			//verifyCorrectness(node, this.tracker);
			return node;
		}
		let n = node;
		if( this.compare( n.value, ls ) > 0 ){
			//verifyCorrectness(node, this.tracker);
			n.l = this.insert(ls, nptr, n.l);
			n.l.p = n;
			//verifyCorrectness(node, this.tracker);
			if(n.l.priority > n.priority) {
				let par = n.p;
				n = this.lrot(n);
				if(par !== null && par.l === node) par.l = n;
				if(par !== null && par.r === node) par.r = n;
			}
			//verifyCorrectness(node, this.tracker);
		} else if( this.compare( n.value, ls ) < 0 ) {
			//verifyCorrectness(node, this.tracker);
			n.r = this.insert(ls, nptr, n.r);
			n.r.p = n;
			//verifyCorrectness(node, this.tracker);
			if(n.r.priority > n.priority) {
				let par = n.p;
				n = this.rrot(n);
				if(par !== null && par.l === node) par.l = n;
				if(par !== null && par.r === node) par.r = n;
			}
			//verifyCorrectness(node, this.tracker);
		}
		if(node === this.tree) this.tree = n;
		//verifyCorrectness(node, this.tracker);
		return n;
	}
	
	// Deletes the node from the dictionary
	delete(ls, node, first=true){
		if(!( ls instanceof Array )) throw new Error("ls is not a line segment " + JSON.stringify(ls));
		if(ls.length !== 2) throw new Error("Line segments must have 2 points");
		if(ls[0].x === undefined || ls[0].y === undefined) throw new Error("The first element of the ls is not a point");
		if(ls[1].x === undefined || ls[1].y === undefined) throw new Error("The second element of the ls is not a point");
		
		if(node.value !== ls) throw new Error("!");
		
		let root = node;
		
		if(root.l === null) {
			if(root.p !== null && root.p.r === root) root.p.r = root.r;
			if(root.p !== null && root.p.l === root) root.p.l = root.r;
			if(root.r !== null) root.r.p = root.p;
			root = root.r;
			this.size--;
		} else if(root.r === null) {
			if(root.p !== null && root.p.r === root) root.p.r = root.l;
			if(root.p !== null && root.p.l === root) root.p.l = root.l;
			if(root.l !== null) root.l.p = root.p;
			root = root.l;
			this.size--;
		} else if(root.l.priority > root.r.priority){
			let par = node.p;
			root = this.lrot(root);
			if(par !== null && par.l === node) par.l = root;
			if(par !== null && par.r === node) par.r = root;
			this.delete(ls, root.r, false);
		} else {
			let par = node.p;
			root = this.rrot(root);
			if(par !== null && par.l === node) par.l = root;
			if(par !== null && par.r === node) par.r = root;
			this.delete(ls, root.l, false);
		}
		
		if(first && node === this.tree) this.tree = root;
		return root;
	}
	
	// Finds the low (L) and high (H) neighbours of ls in the dictionary
	findLH(ls, node){
		if(node === undefined) throw new Error("Undefined node");
		if(node.value !== ls) throw new Error("Invalid node");
		if(!( ls instanceof Array )) throw new Error("ls is not a line segment " + JSON.stringify(ls));
		if(ls.length !== 2) throw new Error("Line segments must have 2 points");
		if(ls[0].x === undefined || ls[0].y === undefined) throw new Error("The first element of the ls is not a point");
		if(ls[1].x === undefined || ls[1].y === undefined) throw new Error("The second element of the ls is not a point");
		
		let l = null, h = null;
		
		let lnode = node.l, rnode = node.r, pnode = node.p;
		while(lnode !== null){
			if(l === null || this.compare(l.value, lnode.value) < 0) l = lnode;
			lnode = lnode.r;
		}
		while(rnode !== null){
			if(h === null || this.compare(h.value, rnode.value) > 0) h = rnode;
			rnode = rnode.l;
		}
		while(pnode !== null){
			if(this.compare(ls, pnode.value) > 0 && (l === null || this.compare(l.value, pnode.value) < 0)) l = pnode;
			if(this.compare(ls, pnode.value) < 0 && (h === null || this.compare(h.value, pnode.value) > 0)) h = pnode;
			pnode = pnode.p;
		}
		
		return [l, h]
	}
	
	// Swaps both nodes on the tree
	swap(node0, node1){
		let p0 = node0.p, l0 = node0.l, r0 = node0.r;
		let p1 = node1.p, l1 = node1.l, r1 = node1.r;
		node1.p = p0 === node1 ? node0 : p0; 
		node1.l = l0 === node1 ? node0 : l0;
		node1.r = r0 === node1 ? node0 : r0;
		node0.p = p1 === node0 ? node1 : p1;
		node0.l = l1 === node0 ? node1 : l1;
		node0.r = r1 === node0 ? node1 : r1;
		if(l0 !== null && l0 !== node1) l0.p = node1;
		if(r0 !== null && r0 !== node1) r0.p = node1;
		if(l1 !== null && l1 !== node0) l1.p = node0;
		if(r1 !== null && r1 !== node0) r1.p = node0;
		if(p0 !== null && p0 !== node1 && p0.l === node0) p0.l = node1;
		if(p0 !== null && p0 !== node1 && p0.r === node0) p0.r = node1;
		if(p1 !== null && p1 !== node0 && p1.l === node1) p1.l = node0;
		if(p1 !== null && p1 !== node0 && p1.r === node1) p1.r = node0;
		let tmp = node0.priority;
		node0.priority = node1.priority;
		node1.priority = tmp;
		
		if(node0 === this.tree) this.tree = node1;
		else if(node1 === this.tree) this.tree = node0;
	}
}

let getID = ( () => {
	let con = 0;
	return (node) => {
		if(node.id === undefined) node.id = con++;
		return node.id;
	};
})();

function verifyCorrectness(tree, tracker, visited = new Object, shouldBe = new Array){
	function compare(ls1, ls2) {
		let mls1 = (ls1[1].y - ls1[0].y)/(ls1[1].x - ls1[0].x);
		let mls2 = (ls2[1].y - ls2[0].y)/(ls2[1].x - ls2[0].x);
		let yls1 = mls1 * tracker.t + ls1[1].y - mls1 * ls1[1].x;
		let yls2 = mls2 * tracker.t + ls2[1].y - mls2 * ls2[1].x;
		return yls2 > yls1 ? 1 : (yls2 < yls1 ? -1 : (mls2 > mls1 ? 1 : (mls2 < mls1 ? -1 : 0) ) );
	}
	
	if(tree === null) return true;
	if(tree.removed) throw new Error("There's a line segment that shouldn't be!");
	if(visited[getID(tree)]) throw new Error("Loop!");
	visited[getID(tree)] = true;
	if(tree.p !== null) {
		if(tree.p.l !== tree && tree.p.r !== tree) throw new Error("My parent does not have me as a child!");
	}
	if(tree.l !== null){
		if(tree.l === tree.r) throw new Error("I have the same child twice!");
		if(tree.l.p !== tree) throw new Error("My left child does not have me as a parent!");
		if(compare(tree.value, tree.l.value) < 0) throw new Error("Unproper hierarchy against left child! " + JSON.stringify(tree.value) + " should be on top of " + JSON.stringify(tree.l.value));
		if(tree.l.priority > tree.priority) throw new Error("Treap invariant broken against left child!");
		verifyCorrectness(tree.l, tracker, visited);
	}
	if(tree.r !== null){
		if(tree.r.p !== tree) throw new Error("My right child does not have me as a parent!");
		if(compare(tree.value, tree.r.value) > 0) throw new Error("Unproper hierarchy against right child! " + JSON.stringify(tree.value) + " should be on bot of " + JSON.stringify(tree.r.value));
		if(tree.r.priority > tree.priority) throw new Error("Treap invariant broken against right child!");
		verifyCorrectness(tree.r, tracker, visited);
	}
	
	for(let ls of shouldBe){
		if(visited[getID(ls)]) continue;
		throw new Error("There's (at least) a line segment missing!");
	}
	return true;
}
