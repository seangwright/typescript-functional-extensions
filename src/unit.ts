export class Unit {
  private static instance: Unit;
  constructor() {
    if (!Unit.instance) {
      Unit.instance = this;
    }

    return Unit.instance;
  }
  static get Instance() {
    return this.instance ?? new Unit();
  }
}
