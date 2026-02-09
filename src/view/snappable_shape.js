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
        this.topConnections = topSnapPoints.map(_ => null);
        this.bottomConnections = bottomSnapPoints.map(_ => null);

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

    static trySnapAtPoint(
        target,
        snapDistance,
        direction,
        pointIndex,
    ) {
        const ownPosition = target.shape.absolutePosition();
        for(let i = 0; i < this.instances.length; i++) {
            const inst = this.instances[i];
            if(inst == target)
                continue;

            const otherPosition = inst.shape.absolutePosition();
            if(direction == "top") {
                const ownPoint = target.topSnapPoints[pointIndex];
                for(let k = 0; k < inst.bottomSnapPoints.length; k++) {
                    const otherPoint = inst.bottomSnapPoints[k];
                    if(target.topCondition(target, inst) &&
                        inst.bottomCondition(inst, target) &&
                        (Math.abs(ownPosition.x + ownPoint.x - otherPosition.x - otherPoint.x) < snapDistance) &&
                        (Math.abs(ownPosition.y + ownPoint.y - otherPosition.y - otherPoint.y) < snapDistance))
                        return {
                            other: inst,
                            direction: "top",
                            ownPoint: ownPoint,
                            otherPoint: otherPoint,
                            ownPointIndex: pointIndex,
                            otherPointIndex: k,
                        };
                }
            }
            else {
                const ownPoint = target.bottomSnapPoints[pointIndex];
                for(let k = 0; k < inst.topSnapPoints.length; k++) {
                    const otherPoint = inst.topSnapPoints[k];
                    if(target.bottomCondition(target, inst) &&
                        inst.topCondition(inst, target) &&
                        (Math.abs(ownPosition.x + ownPoint.x - otherPosition.x - otherPoint.x) < snapDistance) &&
                        (Math.abs(ownPosition.y + ownPoint.y - otherPosition.y - otherPoint.y) < snapDistance))
                        return {
                            other: inst,
                            direction: "bottom",
                            ownPoint: ownPoint,
                            otherPoint: otherPoint,
                            ownPointIndex: pointIndex,
                            otherPointIndex: k,
                        };
                }
            }
        }

        return null;
    }

    static trySnap(target) {
        //const ownPosition = target.shape.absolutePosition();
        for(let i = 0; i < this.instances.length; i++) {
            const inst = this.instances[i];
            if(inst == target)
                continue;

            //const otherPosition = inst.shape.absolutePosition();
            for(let j = 0; j < target.topSnapPoints.length; j++) {
                //const ownPoint = target.topSnapPoints[j];
                const topSnap = this.trySnapAtPoint(target, this.snapDistance, "top", j);
                if(topSnap != null)
                    return topSnap;
            }

            for(let j = 0; j < target.bottomSnapPoints.length; j++) {
                const bottomSnap = this.trySnapAtPoint(target, this.snapDistance, "bottom", j);
                if(bottomSnap != null)
                    return bottomSnap;
            }
        }

        return null;
    }

    static destroy(target) {
        this.instances = this.instances.filter(i => i != target);
        target.shape.destroy();
    }

    static buildConnections() {
        this.instances.forEach(instance => {
            instance.topConnections = instance.topSnapPoints.map(_ => null);
            instance.bottomConnections = instance.bottomSnapPoints.map(_ => null);
        });

        let status = null;

        this.instances.forEach(instance => {
            if(status != null) return;

            instance.topSnapPoints.forEach((_, i) => {
                const snap = this.trySnapAtPoint(instance, 1, "top", i);
                if(snap == null) {
                    status = {
                        status: "failure",
                        reason: "one or more objects are not fully connected.",
                        target: instance,
                    };
                    return;
                }
                if(((instance.topConnections[i] != null) &&
                    (instance.topConnections[i] != snap.other)) ||
                    ((snap.other.bottomConnections[snap.otherPointIndex] != null) &&
                    (snap.other.bottomConnections[snap.otherPointIndex] != instance)))
                    status = {
                        status: "failure",
                        reason: "one or more objects are connected to the same object.",
                        target: instance,
                    };
                else {
                    instance.topConnections[i] = snap.other;
                    snap.other.bottomConnections[snap.otherPointIndex] = instance;
                }
            });

            instance.bottomSnapPoints.forEach((_, i) => {
                const snap = this.trySnapAtPoint(instance, 1, "bottom", i);
                if(snap == null) {
                    status = {
                        status: "failure",
                        reason: "one or more objects are not fully connected.",
                        target: instance,
                    };
                    return null;
                }
                if(((instance.bottomConnections[i] != null) &&
                    (instance.bottomConnections[i] != snap.other)) ||
                    ((snap.other.topConnections[snap.otherPointIndex] != null) &&
                    (snap.other.topConnections[snap.otherPointIndex] != instance)))
                    status = {
                        status: "failure",
                        reason: "one or more objects are connected to the same object.",
                        target: instance,
                    };
                else {
                    instance.bottomConnections[i] = snap.other;
                    snap.other.topConnections[snap.otherPointIndex] = instance;
                }
            });
        });

        if(status == null)
            status = {
                status: "success",
                reason: null,
                target: null,
            };
        
        return status;
    }
}