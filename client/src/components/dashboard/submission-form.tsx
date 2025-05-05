import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TagInput } from "@/components/ui/tag-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Image, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/App";

// Form schema
const formSchema = z.object({
  text: z.string().min(20, "Content must be at least 20 characters"),
  link: z.string().url("Must be a valid URL").or(z.string().length(0)),
  imageUrl: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const SubmissionForm: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available categories
  const { data: availableCategories } = useQuery({
    queryKey: ['/api/content/categories'],
    enabled: isAuthenticated
  });

  // Form handling
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      link: "",
      imageUrl: ""
    }
  });

  // Submit mutation
  const submission = useMutation({
    mutationFn: async (values: FormValues) => {
      if (categories.length === 0) {
        throw new Error("Please add at least one category");
      }
      
      const data = {
        ...values,
        categories
      };
      
      const response = await apiRequest("POST", "/api/content", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content submitted successfully",
        description: "Your content is being analyzed",
      });
      
      // Reset form
      form.reset();
      setCategories([]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/content/user'] });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: FormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please connect your NEAR wallet to submit content",
        variant: "destructive"
      });
      return;
    }
    
    submission.mutate(values);
  };

  // Mock file upload handling
  const handleFileUpload = () => {
    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      form.setValue("imageUrl", "https://source.unsplash.com/random/800x600?web3");
      toast({
        title: "Screenshot uploaded",
        description: "Your screenshot has been uploaded successfully"
      });
    }, 1500);
  };

  return (
    <Card className="bg-dark-200 rounded-xl mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Submit New Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-light-300">Content Text</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your content here..."
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-light-100 min-h-[120px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-light-300">Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 bg-dark-100 border border-dark-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-light-100"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-light-300">Upload Screenshot (Optional)</FormLabel>
                  <FormControl>
                    <div 
                      className="border-2 border-dashed border-dark-100 rounded-lg p-4 text-center hover:border-primary-500 transition-all cursor-pointer"
                      onClick={handleFileUpload}
                    >
                      {field.value ? (
                        <div className="flex items-center justify-center">
                          <Image className="h-5 w-5 text-success mr-2" />
                          <span className="text-success">Screenshot uploaded</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-10 w-10 text-light-300" />
                          <p className="mt-2 text-sm text-light-300">
                            {uploading ? "Uploading..." : "Drag & drop an image or click to browse"}
                          </p>
                        </>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block text-sm font-medium text-light-300 mb-1">Categories & Tags</FormLabel>
              <TagInput
                placeholder="+ Add Tag"
                tags={categories}
                setTags={setCategories}
                availableTags={availableCategories || ["tutorial", "review", "news", "analysis", "promo", "other"]}
                maxTags={5}
                className="w-full"
              />
              {categories.length === 0 && submission.isPending && (
                <p className="text-xs text-destructive mt-1">Please add at least one category</p>
              )}
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-all focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 focus:ring-offset-dark-200"
                disabled={submission.isPending || !isAuthenticated}
              >
                {submission.isPending ? "Submitting..." : "Submit for Analysis"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubmissionForm;
