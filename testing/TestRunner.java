import com.nibm2.tests.ProfileTest;

public class TestRunner {
    public static void main(String[] args) {
        try {
            System.out.println("Trying to instantiate ProfileTest...");
            ProfileTest pt = new ProfileTest();
            System.out.println("Successfully instantiated!");
        } catch (Throwable t) {
            t.printStackTrace();
        }
    }
}
