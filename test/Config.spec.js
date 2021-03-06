import {
    resolve
} from 'path';
import Config from '../src/Config';
import ConfigDependency from '../src/ConfigDependency';

describe('Config', () => {
    let config;

    beforeEach(() => {
        config = new Config();
    });

    describe('.FILENAME', () => {
        it('should be defined', () => {
            expect(Config.FILENAME).toBeTruthy();
        });
    });

    describe('#defaults()', () => {
        it('should not add extra `values`', () => {
            let date1 = new Date(),
                date2 = new Date();

            config.merge({
                foo: 'foo1',
                date: date1
            }).defaults({
                foo: 'foo2',
                bar: ['bar2'],
                date: date2
            }, x => {
                expect(x).toBe(config);

                return {
                    foo: 'foo2'
                };
            }, () => {});

            expect(config.toObject()).toEqual({
                foo: 'foo1',
                bar: ['bar2'],
                date: date1
            });
        });
    });

    describe('#merge()', () => {
        it('should merge `values`', function() {
            config.merge({
                foo: {
                    bar: 'bar1'
                },
                bar: ['bar1']
            }, {
                foo: {
                    bar: 'bar2'
                },
                bar: ['bar2']
            }, x => {
                expect(x).toBe(config);

                return {
                    foo: {
                        bar: 'bar3'
                    }
                };
            }, () => {});

            expect(config.toObject()).toEqual({
                foo: {
                    bar: 'bar3'
                },
                bar: ['bar1', 'bar2']
            });
        });
    });

    describe('#extend()', () => {
        it('should have `dependencyTree`', () => {
            let paths = [];

            config.extend('./test/fixtures/webpack.1.config.js');

            expect(config.dependencyTree).toEqual(jasmine.any(ConfigDependency));

            for (let {node} of config.dependencyTree) {
                paths.push(node.root.filename);
            }

            expect(paths).toEqual([
                resolve('./test/fixtures/webpack.1.config.js'),
                resolve('./test/fixtures/webpack.2.config.js'),
                resolve('./test/fixtures/webpack.3.config.js'),
                resolve('./test/fixtures/webpack.5.config.js'),
                resolve('./test/fixtures/webpack.4.config.js')
            ]);
        });

        it('should extend using `String`', () => {
            config.extend('./test/fixtures/webpack.1.config.js');

            expect(config.toObject()).toEqual({
                tags: [
                    'config1',
                    'config2',
                    'config3',
                    'config5',
                    'config4'
                ]
            });
        });

        it('should extend using `Object<String,Function>`', () => {
            config.extend({
                './test/fixtures/webpack.1.config.js': x => {
                    expect(x).toEqual(jasmine.any(Config));

                    return {
                        tags: [
                            'custom-config1'
                        ]
                    };
                }
            });

            expect(config.toObject()).toEqual({
                tags: [
                    'custom-config1'
                ]
            });
        });

        it('should extend using `Object<String,Function[]>`', () => {
            config.extend({
                './test/fixtures/webpack.1.config.js': [
                    x => {
                        expect(x).toEqual(jasmine.any(Config));
                    },
                    x => {
                        expect(x).toEqual(jasmine.any(Config));

                        return {
                            tags: [
                                'custom-config1'
                            ]
                        };
                    },
                    x => {
                        expect(x).toEqual(jasmine.any(Config));

                        return x.merge({
                            tags: [
                                'custom-config2'
                            ]
                        });
                    }
                ]
            });

            expect(config.toObject()).toEqual({
                tags: [
                    'custom-config1',
                    'custom-config2'
                ]
            });
        });
    });

    describe('#clone()', () => {
        it('should return clone of `Config`', () => {
            config.merge({
                foo1: 'foo1'
            });

            let clone = config.clone();

            expect(config).not.toBe(clone);
            expect(clone).toEqual(jasmine.any(Config));
            expect(config.toObject()).toEqual({
                foo1: 'foo1'
            });
        });
    });

    describe('#toObject()', () => {
        it('should return plain `Object`', () => {
            config.merge({
                foo: 'foo1'
            });

            expect(config.toObject()).toEqual({
                foo: 'foo1'
            });
        });
    });

    describe('.initWith()', () => {
        it('should return `Config`', () => {
            config = Config.initWith({
                foo1: 'foo1'
            }, {
                foo2: 'foo2'
            });

            expect(config).toEqual(jasmine.any(Config));
            expect(config.toObject()).toEqual({
                foo1: 'foo1',
                foo2: 'foo2'
            });
        });
    });
});
