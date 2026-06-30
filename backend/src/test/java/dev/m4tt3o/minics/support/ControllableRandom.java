package dev.m4tt3o.minics.support;

import java.util.Random;

/**
 * Test-only Random that returns predetermined values.
 */
public final class ControllableRandom extends Random {

    private final int[] nextIntValues;
    private final double[] nextDoubleValues;
    private int intIndex;
    private int doubleIndex;

    private ControllableRandom(int[] nextIntValues, double[] nextDoubleValues) {
        this.nextIntValues = nextIntValues;
        this.nextDoubleValues = nextDoubleValues;
    }

    public ControllableRandom() {
        this(new int[0], new double[0]);
    }

    public static ControllableRandom withInts(int... values) {
        return new ControllableRandom(values, new double[0]);
    }

    public static ControllableRandom withDoubles(double... values) {
        return new ControllableRandom(new int[0], values);
    }

    @Override
    public int nextInt(int bound) {
        if (intIndex >= nextIntValues.length) {
            return 0;
        }
        return nextIntValues[intIndex++] % Math.max(bound, 1);
    }

    @Override
    public double nextDouble() {
        if (doubleIndex >= nextDoubleValues.length) {
            return 1.0;
        }
        return nextDoubleValues[doubleIndex++];
    }
}
