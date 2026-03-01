import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "../../components/layout/Header.tsx";
import Footer from "../../components/layout/Footer.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Input } from "../../components/ui/input.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../components/ui/form.tsx";
import { API } from "../../components/shared/api.ts";
import { toast } from "sonner";
import type { QueueData } from "../../components/shared/types.ts";
import { useLanguage } from "../../components/contexts/LanguageContext";

const formatVN = (inputVN: string) => {
  const vn = inputVN.trim();
  if (!vn) return "";
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const datePrefix = `VN${yy}${mm}${dd}-`;

  if (/^\d+$/.test(vn)) return `${datePrefix}${vn.padStart(4, "0")}`;
  if (/^VN\d+$/i.test(vn)) {
    const num = vn.replace(/^VN/i, "");
    return `${datePrefix}${num.padStart(4, "0")}`;
  }
  return vn.toUpperCase();
};

interface PatientVNProps {
  onBack: () => void;
  onSuccess: (data: QueueData) => void;
}

const PatientVN = ({ onSuccess, onBack }: PatientVNProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z
    .object({
      vn: z.string().optional(),
      phone: z.string().optional(),
    })
    .refine(
      (data) => {
        const hasVN = data.vn && data.vn.trim().length > 0;
        const hasPhone = data.phone && data.phone.trim().length > 0;
        return hasVN || hasPhone;
      },
      {
        message: t.patient_vn.error_fill,
        path: ["vn"],
      },
    );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vn: "",
      phone: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      let queueData: QueueData | null = null;

      if (values.vn && values.vn.trim()) {
        const formattedVN = formatVN(values.vn);
        try {
          queueData = await API.getQueueByVN(formattedVN);
        } catch (e) {
          console.error(e);
        }
      }

      if (!queueData && values.phone && values.phone.trim()) {
        try {
          queueData = await API.getQueueByPhone(values.phone.trim());
        } catch (e) {
          console.error(e);
        }
      }

      if (queueData) {
        onSuccess(queueData);
      } else {
        toast.error(t.patient_vn.error_not_found);
        form.setError("vn", { message: t.patient_vn.error_not_found });
      }
    } catch (error) {
      toast.error(t.common.loading);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-white font-sans overflow-hidden">
      <div className="shrink-0">
        <Header />
      </div>
    {/* ฺBack Button */}
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      backgroundColor: "white",
      padding: "8px 16px",
    }}>
      <button
        onClick={onBack}
        style={{
          backgroundColor: "transparent",
          color: "#044C72",
          border: "none",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        ← {t.common.back}
      </button>
    </div>
    
      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full pb-4">
        <div className="w-full max-w-[320px] sm:max-w-md space-y-4 sm:space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-[#044C72] text-2xl sm:text-4xl font-bold tracking-tight">
              {t.patient_vn.title}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm font-light">
              {t.patient_vn.subtitle}
            </p>
          </div>

          <div
            className="bg-white rounded-3xl p-5 sm:p-8 relative transition-all"
            style={{
              border: "2px solid #437524",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 sm:space-y-5"
              >
                {/* VN Input */}
                <FormField
                  control={form.control}
                  name="vn"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <label className="text-[#044C72] text-sm font-medium ml-1 block">
                        {t.patient_vn.label_vn}
                      </label>
                      <FormControl>
                        <Input
                          placeholder={t.patient_vn.placeholder_vn}
                          className="h-10 sm:h-12 border-[#BEBEBE] rounded-xl text-sm sm:text-base text-gray-700 placeholder:text-gray-300 focus:border-[#6B9E36] focus:ring-[#6B9E36]/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] sm:text-sm pl-1" />
                    </FormItem>
                  )}
                />

                {/* Phone Input */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <label className="text-[#044C72] text-sm font-medium ml-1 block">
                        {t.patient_vn.label_phone}
                      </label>
                      <FormControl>
                        <Input
                          placeholder={t.patient_vn.placeholder_phone}
                          className="h-10 sm:h-12 border-[#BEBEBE] rounded-xl text-sm sm:text-base text-gray-700 placeholder:text-gray-300 focus:border-[#6B9E36] focus:ring-[#6B9E36]/20 transition-all"
                          type="tel"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] sm:text-sm pl-1" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-2 sm:pt-4 flex justify-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-48 h-10 sm:h-12 text-white font-bold text-base sm:text-lg rounded-2xl shadow-md transition-all active:scale-[0.98]"
                    style={{
                      background: "#87E74B",
                      boxShadow: "0 4px 10px rgba(114, 210, 56, 0.3)",
                    }}
                  >
                    {isLoading ? t.common.loading : t.patient_vn.check_btn}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <div className="shrink-0 w-full">
        <Footer />
      </div>
    </div>
  );
};

export default PatientVN;
