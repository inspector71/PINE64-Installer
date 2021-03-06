'use strict';

const m = require('mochainon');
const angular = require('angular');
require('angular-mocks');

/**
 * spec changes and why
 * - default speed is -1, because we don't want to show speed state when speed is -1
 */

describe('Browser: FlashStateModel', function() {

  beforeEach(angular.mock.module(
    require('../../../lib/gui/models/flash-state')
  ));

  describe('FlashStateModel', function() {

    let FlashStateModel;

    beforeEach(angular.mock.inject(function(_FlashStateModel_) {
      FlashStateModel = _FlashStateModel_;
    }));

    describe('.resetState()', function() {

      it('should be able to reset the progress state', function() {
        FlashStateModel.setFlashingFlag();
        FlashStateModel.setProgressState({
          type: 'write',
          percentage: 50,
          eta: 15,
          speed: 100000000000
        });

        FlashStateModel.resetState();

        m.chai.expect(FlashStateModel.getFlashState()).to.deep.equal({
          percentage: 0,
          speed: -1
        });
      });

      it('should be able to reset the progress state', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: false,
          sourceChecksum: '1234'
        });

        FlashStateModel.resetState();
        m.chai.expect(FlashStateModel.getFlashResults()).to.deep.equal({});
      });

    });

    describe('.isFlashing()', function() {

      it('should return false by default', function() {
        m.chai.expect(FlashStateModel.isFlashing()).to.be.false;
      });

      it('should return true if flashing', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(FlashStateModel.isFlashing()).to.be.true;
      });

    });

    describe('.setProgressState()', function() {

      it('should not allow setting the state if flashing is false', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: false,
          sourceChecksum: '1234'
        });

        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            eta: 15,
            speed: 100000000000
          });
        }).to.throw('Can\'t set the flashing state when not flashing');
      });

      it('should throw if type is missing', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            percentage: 50,
            eta: 15,
            speed: 100000000000
          });
        }).to.throw('Missing state type');
      });

      it('should throw if type is not a string', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 1234,
            percentage: 50,
            eta: 15,
            speed: 100000000000
          });
        }).to.throw('Invalid state type: 1234');
      });

      it('should not throw if percentage is 0', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 0,
            eta: 15,
            speed: 100000000000
          });
        }).to.not.throw('Missing state percentage');
      });

      it('should throw if percentage is missing', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            eta: 15,
            speed: 100000000000
          });
        }).to.throw('Missing state percentage');
      });

      it('should throw if percentage is not a number', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: '50',
            eta: 15,
            speed: 100000000000
          });
        }).to.throw('Invalid state percentage: 50');
      });

      it('should throw if eta is missing', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            speed: 100000000000
          });
        }).to.throw('Missing state eta');
      });

      it('should not throw if eta is equal to zero', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            eta: 0,
            speed: 100000000000
          });
        }).to.not.throw('Missing state eta');
      });

      it('should throw if eta is not a number', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            eta: '15',
            speed: 100000000000
          });
        }).to.throw('Invalid state eta: 15');
      });

      it('should throw if speed is missing', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            eta: 15
          });
        }).to.throw('Missing state speed');
      });

      it('should not throw if speed is 0', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(function() {
          FlashStateModel.setProgressState({
            type: 'write',
            percentage: 50,
            eta: 15,
            speed: 0
          });
        }).to.not.throw('Missing state speed');
      });

    });

    describe('.getFlashResults()', function() {

      it('should get the flash results', function() {
        FlashStateModel.setFlashingFlag();

        const expectedResults = {
          cancelled: false,
          sourceChecksum: '1234'
        };

        FlashStateModel.unsetFlashingFlag(expectedResults);
        const results = FlashStateModel.getFlashResults();
        m.chai.expect(results).to.deep.equal(expectedResults);
      });

    });

    describe('.getFlashState()', function() {

      it('should initially return an empty state', function() {
        FlashStateModel.resetState();
        const flashState = FlashStateModel.getFlashState();
        m.chai.expect(flashState).to.deep.equal({
          percentage: 0,
          speed: -1
        });
      });

      it('should return the current flash state', function() {
        const state = {
          type: 'write',
          percentage: 50,
          eta: 15,
          speed: 0
        };

        FlashStateModel.setFlashingFlag();
        FlashStateModel.setProgressState(state);
        const flashState = FlashStateModel.getFlashState();
        m.chai.expect(flashState).to.deep.equal(state);
      });

    });

    describe('.unsetFlashingFlag()', function() {

      it('should throw if no flashing results', function() {
        m.chai.expect(function() {
          FlashStateModel.unsetFlashingFlag();
        }).to.throw('Missing results');
      });

      it('should be able to set a string error code', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: false,
          sourceChecksum: '1234',
          errorCode: 'EBUSY'
        });

        m.chai.expect(FlashStateModel.getLastFlashErrorCode()).to.equal('EBUSY');
      });

      it('should be able to set a number error code', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: false,
          sourceChecksum: '1234',
          errorCode: 123
        });

        m.chai.expect(FlashStateModel.getLastFlashErrorCode()).to.equal(123);
      });

      it('should throw if errorCode is not a number not a string', function() {
        m.chai.expect(function() {
          FlashStateModel.unsetFlashingFlag({
            cancelled: false,
            sourceChecksum: '1234',
            errorCode: {
              name: 'EBUSY'
            }
          });
        }).to.throw('Invalid results errorCode: [object Object]');
      });

      it('should default cancelled to false', function() {
        FlashStateModel.unsetFlashingFlag({
          sourceChecksum: '1234'
        });

        const flashResults = FlashStateModel.getFlashResults();

        m.chai.expect(flashResults).to.deep.equal({
          cancelled: false,
          sourceChecksum: '1234'
        });
      });

      it('should throw if cancelled is not boolean', function() {
        m.chai.expect(function() {
          FlashStateModel.unsetFlashingFlag({
            cancelled: 'false',
            sourceChecksum: '1234'
          });
        }).to.throw('Invalid results cancelled: false');
      });

      it('should throw if cancelled is true and sourceChecksum exists', function() {
        m.chai.expect(function() {
          FlashStateModel.unsetFlashingFlag({
            cancelled: true,
            sourceChecksum: '1234'
          });
        }).to.throw('The sourceChecksum value can\'t exist if the flashing was cancelled');
      });

      it('should be able to set flashing to false', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: false,
          sourceChecksum: '1234'
        });

        m.chai.expect(FlashStateModel.isFlashing()).to.be.false;
      });

      it('should reset the flashing state', function() {
        FlashStateModel.setFlashingFlag();

        FlashStateModel.setProgressState({
          type: 'write',
          percentage: 50,
          eta: 15,
          speed: 100000000000
        });

        m.chai.expect(FlashStateModel.getFlashState()).to.not.deep.equal({
          percentage: 0,
          speed: -1
        });

        FlashStateModel.unsetFlashingFlag({
          cancelled: false,
          sourceChecksum: '1234'
        });

        m.chai.expect(FlashStateModel.getFlashState()).to.deep.equal({
          percentage: 0,
          speed: -1
        });
      });

    });

    describe('.setFlashingFlag()', function() {

      it('should be able to set flashing to true', function() {
        FlashStateModel.setFlashingFlag();
        m.chai.expect(FlashStateModel.isFlashing()).to.be.true;
      });

      it('should reset the flash results', function() {
        const expectedResults = {
          cancelled: false,
          sourceChecksum: '1234'
        };

        FlashStateModel.unsetFlashingFlag(expectedResults);
        const results = FlashStateModel.getFlashResults();
        m.chai.expect(results).to.deep.equal(expectedResults);
        FlashStateModel.setFlashingFlag();
        m.chai.expect(FlashStateModel.getFlashResults()).to.deep.equal({});
      });

    });

    describe('.wasLastFlashCancelled()', function() {

      it('should return false given a pristine state', function() {
        FlashStateModel.resetState();
        m.chai.expect(FlashStateModel.wasLastFlashCancelled()).to.be.false;
      });

      it('should return false if !cancelled', function() {
        FlashStateModel.unsetFlashingFlag({
          sourceChecksum: '1234',
          cancelled: false
        });

        m.chai.expect(FlashStateModel.wasLastFlashCancelled()).to.be.false;
      });

      it('should return true if cancelled', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: true
        });

        m.chai.expect(FlashStateModel.wasLastFlashCancelled()).to.be.true;
      });

    });

    describe('.getLastFlashSourceChecksum()', function() {

      it('should return undefined given a pristine state', function() {
        FlashStateModel.resetState();
        m.chai.expect(FlashStateModel.getLastFlashSourceChecksum()).to.be.undefined;
      });

      it('should return the last flash source checksum', function() {
        FlashStateModel.unsetFlashingFlag({
          sourceChecksum: '1234',
          cancelled: false
        });

        m.chai.expect(FlashStateModel.getLastFlashSourceChecksum()).to.equal('1234');
      });

      it('should return undefined if the last flash was cancelled', function() {
        FlashStateModel.unsetFlashingFlag({
          cancelled: true
        });

        m.chai.expect(FlashStateModel.getLastFlashSourceChecksum()).to.be.undefined;
      });

    });

    describe('.getLastFlashErrorCode()', function() {

      it('should return undefined given a pristine state', function() {
        FlashStateModel.resetState();
        m.chai.expect(FlashStateModel.getLastFlashErrorCode()).to.be.undefined;
      });

      it('should return the last flash error code', function() {
        FlashStateModel.unsetFlashingFlag({
          sourceChecksum: '1234',
          cancelled: false,
          errorCode: 'ENOSPC'
        });

        m.chai.expect(FlashStateModel.getLastFlashErrorCode()).to.equal('ENOSPC');
      });

      it('should return undefined if the last flash did not report an error code', function() {
        FlashStateModel.unsetFlashingFlag({
          sourceChecksum: '1234',
          cancelled: false
        });

        m.chai.expect(FlashStateModel.getLastFlashErrorCode()).to.be.undefined;
      });

    });

  });

});
