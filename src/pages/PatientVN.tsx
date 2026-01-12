import { useState } from "react";
// import { useNavigate } from "react-router-dom"; // ไม่ได้ใช้แล้วในเวอร์ชันนี้
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "../components/layout/Header.tsx";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { API } from "../components/shared/api.ts";
import { toast } from "sonner";
import type { QueueData } from "../components/shared/types";

// --- Schema & Logic เดิม ---
const formSchema = z.object({
  vn: z.string().trim().min(1, { message: "กรุณากรอกหมายเลข VN" }),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, { message: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก" }),
});

type FormValues = z.infer<typeof formSchema>;

const formatVN = (
  inputVN: string
): { formatted: string; error: string | null } => {
  let vn = inputVN.trim();
  if (!vn) return { formatted: "", error: "กรุณากรอกเลข VN" };
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const datePrefix = `VN${yy}${mm}${dd}-`;

  if (/^\d+$/.test(vn))
    return { formatted: `${datePrefix}${vn.padStart(4, "0")}`, error: null };
  if (/^VN\d+$/i.test(vn)) {
    const num = vn.replace(/^VN/i, "");
    return { formatted: `${datePrefix}${num.padStart(4, "0")}`, error: null };
  }
  if (/^VN\d{6}-\d{4}$/i.test(vn))
    return { formatted: vn.toUpperCase(), error: null };

  return { formatted: "", error: "รูปแบบ VN ไม่ถูกต้อง" };
};

// --- Component ---
interface PatientVNProps {
  onBack: () => void;
  onSuccess: (data: QueueData) => void;
}

const PatientVN = ({ onBack, onSuccess }: PatientVNProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vn: "",
      phone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const { formatted: formattedVN, error: vnError } = formatVN(values.vn);

    if (vnError) {
      form.setError("vn", { message: vnError });
      return;
    }

    setIsLoading(true);
    try {
      const queueData = await API.getQueueByVN(formattedVN);
      if (queueData) {
        onSuccess(queueData);
      } else {
        toast.error("ไม่พบคิวที่ตรงกับหมายเลข VN นี้");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <h2 className="text-[#1F3A60] text-4xl sm:text-5xl font-bold tracking-tight">
              ตรวจสอบคิว
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              ตรวจสอบคิวของท่านด้วยเลข VN
            </p>
          </div>

          {/* Card Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* VN Field */}
                <FormField
                  control={form.control}
                  name="vn"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Visit Number (หมายเลขการมาใช้บริการ)
                      </label>
                      <FormControl>
                        <Input
                          placeholder="ตัวอย่าง: VN123112313"
                          className="h-12 bg-[#F8F9FA] border-gray-200 focus:border-[#005691] focus:ring-[#005691]/20 rounded-lg text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        เบอร์โทรศัพท์
                      </label>
                      <FormControl>
                        <Input
                          placeholder="ตัวอย่าง: 0888888888"
                          className="h-12 bg-[#F8F9FA] border-gray-200 focus:border-[#005691] focus:ring-[#005691]/20 rounded-lg text-base"
                          type="tel"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-lg rounded-full shadow-sm mt-4 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบคิว"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientVN;
