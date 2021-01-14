import { Vector3 } from './math-utils';
export declare class SphericalCoordinate {
    horizontalRadians: number;
    verticalRadians: number;
    distance: number;
    constructor(horizontalRadians?: number, verticalRadians?: number, distance?: number);
    get horizontalDegrees(): number;
    set horizontalDegrees(h: number);
    get verticalDegrees(): number;
    set verticalDegrees(h: number);
    setWithRadians(horizontal: number, vertical: number, distance: number): this;
    setWithDegrees(horizontal: number, vertical: number, distance: number): this;
    fromCartesianDirection(cartesian: Vector3): this;
    fromCartesianPosition(cartesian: Vector3): this;
    toCartesianDirection(out: Vector3): Vector3;
    toCartesianPosition(out: Vector3): Vector3;
}
