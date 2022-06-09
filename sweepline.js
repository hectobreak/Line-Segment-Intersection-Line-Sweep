function findIntersection(l1, l2){
	if(l1[0].x > l2[0].x) return findIntersection(l2, l1);
	
	let ax = l1[0].x, ay = l1[0].y, bx = l1[1].x, by = l1[1].y,
	    cx = l2[0].x, cy = l2[0].y, dx = l2[1].x, dy = l2[1].y;
	
	let det = (cy - dy) * (bx - ax) - (dx - cx) * (ay - by);
	
	if(det === 0) return null;
	
	let l = ( (cy - dy) * (cx - ax) + (dx - cx) * (cy - ay) )/det;
	let m = ( (ay - by) * (cx - ax) + (bx - ax) * (cy - ay) )/det;
	
	if(l < 0 || l > 1) return null;
	if(m < 0 || m > 1) return null;
	
	return {x: ax + (bx - ax) * l, y: ay + (by - ay) * l};
}

let tracker = {t: -Infinity};
let comp = ( p1, p2 ) => p1.point.x - p2.point.x;
let linesegments = new Array;
let PQ = new Array;
let DS = new LineSegmentDictionary(tracker);

let collisions = new Array;
let end = false;
let shouldBe = new Array;

function sweeplinestep( animation ){
	if(PQ.length === 0){
		tracker.t = Infinity;
		if(animation !== undefined) animation(tracker.t);
		return;
	}
	let top = PQ.popWithPriority(comp, false);
	if(top.point.x <= tracker.t) return;
	
	let previous_t = tracker.t;
	tracker.t = top.point.x;
	let current_t = tracker.t;
	
	/*
	tracker.t = (previous_t + current_t) * 0.5;
	verifyCorrectness(DS.tree, tracker, new Object, shouldBe);
	tracker.t = current_t;
	*/
	
	let neighbours;
	//console.log(top);
	switch(top.type){
		case 's':
			let sptr = {ptr: null};
			DS.insert(top.ls, sptr);
			let snode = sptr.ptr;
			top.lsnode.lsnode = snode;
			neighbours = DS.findLH(top.ls, snode);
			let closest = null, intersection = {x: Infinity, y: Infinity};
			for(let n of neighbours){
				if(n === null) continue;
				let i = findIntersection(top.ls, n.value);
				if(i === null) continue;
				if(i.x < tracker.t) continue;
				if(i.x > intersection.x) continue;
				intersection = i;
				closest = n;
			}
			if(closest !== null) PQ.addWithPriority({type: 'x', point: intersection, ls: [top.ls, closest.value], lsnode: [snode, closest]}, comp);
			//shouldBe.push(snode);
		break;
		case 'e':
			neighbours = DS.findLH(top.ls, top.lsnode);
			if(neighbours[0] !== null && neighbours[1] !== null){
				let i = findIntersection(neighbours[0].value, neighbours[1].value);
				if(i !== null && i.x > tracker.t) 
					PQ.addWithPriority( {type: 'x', point: i, ls: [neighbours[0].value, neighbours[1].value], lsnode: [neighbours[0], neighbours[1]]}, comp );
			}
			DS.delete(top.ls, top.lsnode);
			top.lsnode.removed = true;
			//shouldBe = shouldBe.filter( x => x !== top.lsnode );
		break;
		case 'x':
			collisions.push( top.point ); // Report crossing
			tracker.t = (previous_t + current_t) * 0.5;
			let N0 = DS.findLH(top.ls[0], top.lsnode[0]), N1 = DS.findLH(top.ls[1], top.lsnode[1]);
			
			for(let [n0, n1] of [N0, N1]){
				if(n0 !== null && n1 !== null){
					let i = findIntersection(n0.value, n1.value);
					if(i !== null && i.x > tracker.t) 
						PQ.addWithPriority( {type: 'x', point: i, ls: [n0.value, n1.value], lsnode: [n0, n1]}, comp );
				}
			}
			
			tracker.t = current_t;
			DS.swap(...top.lsnode);
			
		break;
		default:
	}
	if(animation !== undefined) animation(tracker.t);
}

function init(lss){
    shouldBe = new Array;
	collisions = new Array;
	tracker = { t: -Infinity };
	linesegments = lss;
	
	linesegments.map( x => x.sort( (y, z) => y.x - z.x ) );
	
	PQ = linesegments.map(x => {return {type: 'e', point: x[1], ls: x}});
	PQ = PQ.concat(linesegments.map((x,i) => {return {type: 's', point: x[0], ls: x, lsnode: PQ[i]}}));
	PQ.makeHeap(comp);
	
	DS = new LineSegmentDictionary(tracker);
}


function sweepline(lss){
	init(lss);
	while(PQ.length > 0){
		sweeplinestep();
	}
}
