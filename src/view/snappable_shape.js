export class SnappableShape {
    static snapDistance = 10;
    static instances = [];

    constructor({
        parent,
        shape,
        topCondition = (self, other) => true,
        bottomCondition = (self, other) => true,
        topSnapPoints = [],
        bottomSnapPoints = [],
    }) {
        this.parent = parent;
        this.shape = shape;
        this.topCondition = topCondition;
        this.bottomCondition = bottomCondition;
        this.topSnapPoints = topSnapPoints;
        this.bottomSnapPoints = bottomSnapPoints;

        SnappableShape.instances.push(this);

        const ss = this;
        shape.on('dragmove', function (e) {
            if(e.target == shape) {
                //console.log("drag move");
                const snap = SnappableShape.trySnap(ss);
                if(snap != null) {
                    const otherPos = snap.other.shape.absolutePosition();
                    shape.absolutePosition({
                        x: otherPos.x + snap.otherPoint.x - snap.ownPoint.x,
                        y: otherPos.y + snap.otherPoint.y - snap.ownPoint.y,
                    })
                }
            }
        });

        shape.on('dragend', function (e) {
            if(e.target == shape) {
                //console.log("drag end");
            }
        });

        shape.on('dblclick', () => {
            SnappableShape.destroy(ss);
        });
    }

    static trySnap(target) {
        const ownPosition = target.shape.absolutePosition();
        for(let i = 0; i < this.instances.length; i++) {
            const inst = this.instances[i];
            if(inst == target)
                continue;

            const otherPosition = inst.shape.absolutePosition();
            for(let j = 0; j < target.topSnapPoints.length; j++) {
                const ownPoint = target.topSnapPoints[j];
                for(let k = 0; k < inst.bottomSnapPoints.length; k++) {
                    const otherPoint = inst.bottomSnapPoints[k];
                    if(target.topCondition(target, inst) &&
                        inst.bottomCondition(inst, target) &&
                        (Math.abs(ownPosition.x + ownPoint.x - otherPosition.x - otherPoint.x) < this.snapDistance) &&
                        (Math.abs(ownPosition.y + ownPoint.y - otherPosition.y - otherPoint.y) < this.snapDistance))
                        return {
                            other: inst,
                            direction: "top",
                            ownPoint: ownPoint,
                            otherPoint: otherPoint,
                        };
                }
            }

            for(let j = 0; j < target.bottomSnapPoints.length; j++) {
                const ownPoint = target.bottomSnapPoints[j];
                for(let k = 0; k < inst.topSnapPoints.length; k++) {
                    const otherPoint = inst.topSnapPoints[k];
                    if(target.bottomCondition(target, inst) &&
                        inst.topCondition(inst, target) &&
                        (Math.abs(ownPosition.x + ownPoint.x - otherPosition.x - otherPoint.x) < this.snapDistance) &&
                        (Math.abs(ownPosition.y + ownPoint.y - otherPosition.y - otherPoint.y) < this.snapDistance))
                        return {
                            other: inst,
                            direction: "bottom",
                            ownPoint: ownPoint,
                            otherPoint: otherPoint,
                        };
                }
            }
        }

        return null;
    }

    static destroy(target) {
        this.instances.filter(i => i != target);
        target.shape.destroy();
    }
}