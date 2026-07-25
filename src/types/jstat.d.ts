declare module "jstat" {

    const jStat: {
        beta: {
            sample(alpha: number, beta: number): number;
        };

        normal: {
            sample(mean: number, sigma: number): number;
        };

        poisson: {
            sample(lambda: number): number;
        };
    };

    export default jStat;
}