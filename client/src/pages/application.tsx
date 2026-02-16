import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Printer, ArrowLeft, ArrowRight, Save, Loader2, Plus, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

type FormData = Record<string, unknown>;

function TermsContent() {
  return (
    <div className="space-y-4 text-sm text-foreground leading-relaxed">
      <h3 className="font-semibold text-base">Terms and Conditions</h3>
      <p>
        By using this service, you agree to the following terms and conditions
        governing the submission of your visa application through Global Visas.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          All information provided in this application must be accurate and
          truthful. Providing false or misleading information may result in the
          refusal of your visa application.
        </li>
        <li>
          You understand that Global Visas acts as an authorized representative
          to assist with visa applications and does not guarantee the outcome
          of any application.
        </li>
        <li>
          Processing times may vary. Global Visas is not responsible for delays
          caused by government authorities or third parties.
        </li>
        <li>
          You consent to the collection, storage, and processing of your
          personal data in accordance with applicable privacy laws and our
          Privacy Policy.
        </li>
        <li>
          All documents submitted become part of your application record and
          may be shared with relevant government authorities as required.
        </li>
        <li>
          You agree to promptly provide any additional information or
          documentation requested during the processing of your application.
        </li>
        <li>
          Application fees are non-refundable once the application has been
          submitted to the relevant authority.
        </li>
      </ul>

      <h3 className="font-semibold text-base mt-6">Privacy Statement</h3>
      <p>
        Global Visas is committed to protecting your privacy. We collect
        personal information necessary for processing your visa application,
        including but not limited to: name, date of birth, passport details,
        employment history, and travel plans.
      </p>
      <p>
        Your information is stored securely and is only shared with relevant
        government authorities as required for your application. We do not sell
        or share your personal data with third parties for marketing purposes.
      </p>
      <p>
        You have the right to access, correct, or request deletion of your
        personal data at any time by contacting our support team.
      </p>
    </div>
  );
}

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina",
  "Brazil", "Brunei", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China",
  "Colombia", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Ecuador",
  "Egypt", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Georgia", "Germany",
  "Ghana", "Greece", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kuwait", "Laos", "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg",
  "Macau", "Malaysia", "Maldives", "Malta", "Mexico", "Mongolia", "Morocco", "Myanmar",
  "Nepal", "Netherlands", "New Zealand", "Nigeria", "North Korea", "Norway", "Oman",
  "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore",
  "Slovakia", "Slovenia", "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka",
  "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Thailand", "Tonga",
  "Tunisia", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam",
  "Yemen", "Zimbabwe",
];

const LEGAL_STATUSES = [
  "Citizen",
  "Permanent Resident",
  "Visitor",
  "Student",
  "Work Visa",
  "No Legal Status",
  "Other",
];

const VISIT_REASONS = [
  "Business",
  "Tourism",
  "Family Visit",
  "Study",
  "Religious Event",
  "Other",
];

const GROUP_TYPES = [
  "Entertainment",
  "Family",
  "Friends",
  "Incentive Tour",
  "School / Study",
  "Sports Team / Sports Event",
  "Work / Employer",
  "Other",
];

const FURTHER_STAY_LENGTHS = [
  "Up to 3 months",
  "Up to 6 months",
  "Up to 12 months",
];

const RELATIONSHIP_STATUSES = [
  "De Facto",
  "Divorced",
  "Engaged",
  "Married",
  "Never Married",
  "Separated",
  "Widowed",
];

interface StepProps {
  formData: FormData;
  updateFormData: (updates: FormData) => void;
}

function Step1Terms({ formData, updateFormData }: StepProps) {
  const [showTerms, setShowTerms] = useState(false);
  const agreed = formData.termsAccepted === true;

  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Terms and Conditions</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="text-primary text-sm font-medium underline"
            data-testid="button-view-terms"
          >
            {showTerms ? "Hide Terms and Conditions" : "View Terms and Conditions"}
          </button>
          <br />
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="text-primary text-sm font-medium underline"
            data-testid="button-view-privacy"
          >
            View Privacy Statement
          </button>
        </div>

        {showTerms && (
          <Card>
            <CardContent className="p-4 max-h-96 overflow-y-auto">
              <TermsContent />
            </CardContent>
          </Card>
        )}

        <div className="flex items-start gap-3 py-4">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => updateFormData({ termsAccepted: checked === true })}
            data-testid="checkbox-terms"
          />
          <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            I have read and agree to the terms and conditions
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupDetailsDialog({
  open,
  onOpenChange,
  formData,
  updateFormData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  updateFormData: (updates: FormData) => void;
}) {
  const [groupCreated, setGroupCreated] = useState<string>(
    (formData.groupAlreadyCreated as string) || ""
  );
  const [groupId, setGroupId] = useState<string>(
    (formData.groupId as string) || ""
  );
  const [groupName, setGroupName] = useState<string>(
    (formData.groupName as string) || ""
  );
  const [groupType, setGroupType] = useState<string>(
    (formData.groupType as string) || ""
  );

  useEffect(() => {
    if (open) {
      setGroupCreated((formData.groupAlreadyCreated as string) || "");
      setGroupId((formData.groupId as string) || "");
      setGroupName((formData.groupName as string) || "");
      setGroupType((formData.groupType as string) || "");
    }
  }, [open, formData]);

  const handleConfirm = () => {
    const updates: FormData = { groupAlreadyCreated: groupCreated };
    if (groupCreated === "yes") {
      updates.groupId = groupId;
      updates.groupName = undefined;
      updates.groupType = undefined;
    } else if (groupCreated === "no") {
      updates.groupName = groupName;
      updates.groupType = groupType;
      updates.groupId = undefined;
    }
    updateFormData(updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg">Group details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-primary">Group details</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>If you have previously created a group, select Yes and enter the Group ID. Otherwise select No to create a new group.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div>
            <p className="text-sm mb-3">Has the group already been created?</p>
            <RadioGroup
              value={groupCreated}
              onValueChange={(val) => setGroupCreated(val)}
              className="flex items-center gap-6"
              data-testid="radio-group-created"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="group-created-yes" data-testid="radio-group-created-yes" />
                <Label htmlFor="group-created-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="group-created-no" data-testid="radio-group-created-no" />
                <Label htmlFor="group-created-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {groupCreated === "yes" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Group ID</Label>
                <Input
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="Enter group ID"
                  data-testid="input-group-id"
                />
              </div>
            </div>
          )}

          {groupCreated === "no" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter group name to create a new group</p>
              <div className="space-y-2">
                <Label className="text-sm">Group name</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  data-testid="input-group-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Group type</Label>
                <Select value={groupType} onValueChange={(val) => setGroupType(val)}>
                  <SelectTrigger data-testid="select-group-type">
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROUP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-group-cancel">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!groupCreated} data-testid="button-group-confirm">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Step2ApplicationContext({ formData, updateFormData }: StepProps) {
  const outsideAustralia = formData.outsideAustralia as string | undefined;
  const visaStream = formData.visaStream as string | undefined;
  const reasons = (formData.visitReasons as string[]) || [];
  const [selectedReason, setSelectedReason] = useState("");
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [streamWarningOpen, setStreamWarningOpen] = useState(false);
  const [pendingReason, setPendingReason] = useState("");

  const addReason = () => {
    if (selectedReason && !reasons.includes(selectedReason)) {
      if (visaStream === "tourist" && selectedReason === "Business") {
        setPendingReason(selectedReason);
        setStreamWarningOpen(true);
        return;
      }
      updateFormData({ visitReasons: [...reasons, selectedReason] });
      setSelectedReason("");
    }
  };

  const confirmWarningReason = () => {
    if (pendingReason && !reasons.includes(pendingReason)) {
      updateFormData({ visitReasons: [...reasons, pendingReason] });
      setSelectedReason("");
    }
    setPendingReason("");
    setStreamWarningOpen(false);
  };

  const cancelWarningReason = () => {
    setPendingReason("");
    setStreamWarningOpen(false);
  };

  const removeReason = (index: number) => {
    const updated = reasons.filter((_, i) => i !== index);
    updateFormData({ visitReasons: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Application context</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">Current location</h3>
            <p className="text-sm mb-3">Is the applicant currently outside Australia?</p>
            <RadioGroup
              value={outsideAustralia || ""}
              onValueChange={(val) => updateFormData({ outsideAustralia: val })}
              className="flex items-center gap-6"
              data-testid="radio-outside-australia"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="outside-yes" data-testid="radio-outside-yes" />
                <Label htmlFor="outside-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="outside-no" data-testid="radio-outside-no" />
                <Label htmlFor="outside-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          {outsideAustralia === "yes" && (
            <div className="space-y-6 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Give the current location of the applicant and their legal status at this location.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Current location</Label>
                  <Select
                    value={(formData.currentLocation as string) || ""}
                    onValueChange={(val) => updateFormData({ currentLocation: val })}
                  >
                    <SelectTrigger data-testid="select-current-location">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Legal status</Label>
                  <Select
                    value={(formData.legalStatus as string) || ""}
                    onValueChange={(val) => updateFormData({ legalStatus: val })}
                  >
                    <SelectTrigger data-testid="select-legal-status">
                      <SelectValue placeholder="Select legal status" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Purpose of stay</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Select the visa stream that best matches your purpose of travel to Australia.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">Select the stream the applicant is applying for:</p>
                <RadioGroup
                  value={visaStream || ""}
                  onValueChange={(val) => updateFormData({ visaStream: val })}
                  className="space-y-2"
                  data-testid="radio-visa-stream"
                >
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="business" id="stream-business" className="mt-0.5" data-testid="radio-stream-business" />
                    <Label htmlFor="stream-business" className="text-sm cursor-pointer leading-relaxed">
                      Business Visitor stream (business visit for meetings, conferences or negotiations but not for work)
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="frequent" id="stream-frequent" className="mt-0.5" data-testid="radio-stream-frequent" />
                    <Label htmlFor="stream-frequent" className="text-sm cursor-pointer leading-relaxed">
                      Frequent Traveller stream (tourism or business purposes)
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="sponsored" id="stream-sponsored" className="mt-0.5" data-testid="radio-stream-sponsored" />
                    <Label htmlFor="stream-sponsored" className="text-sm cursor-pointer leading-relaxed">
                      Sponsored Family stream (requires Sponsorship form 1149)
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="tourist" id="stream-tourist" className="mt-0.5" data-testid="radio-stream-tourist" />
                    <Label htmlFor="stream-tourist" className="text-sm cursor-pointer leading-relaxed">
                      Tourist stream (tourism/visit family or friends)
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Once the application has been lodged, the stream cannot be changed. For more information on each stream, click on the help icon above.
                </p>

                {visaStream === "frequent" && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-md space-y-3">
                    <p className="text-sm font-medium">
                      <span className="font-semibold">Note:</span> This stream has a higher application fee and is only available to applicants with a passport from an eligible country.
                    </p>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Select the applicant's initial purpose of stay</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select whether the primary purpose is business or tourism</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <RadioGroup
                      value={(formData.frequentPurpose as string) || ""}
                      onValueChange={(val) => updateFormData({ frequentPurpose: val })}
                      className="flex items-center gap-6"
                      data-testid="radio-frequent-purpose"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="business" id="freq-business" data-testid="radio-freq-business" />
                        <Label htmlFor="freq-business" className="text-sm cursor-pointer">Business</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="tourism" id="freq-tourism" data-testid="radio-freq-tourism" />
                        <Label htmlFor="freq-tourism" className="text-sm cursor-pointer">Tourism</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {visaStream === "sponsored" && (
                  <div className="mt-4 p-3 bg-accent/50 rounded-md">
                    <p className="text-sm">
                      <span className="font-semibold">Note:</span> The Sponsored Family stream has more restrictive conditions than the Tourist stream. In some cases a security bond may be requested. If you are planning to visit family, you can apply for the Tourist stream which does not require a bond and does not require formal sponsorship.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm">List all reasons for visiting Australia</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedReason}
                    onValueChange={(val) => setSelectedReason(val)}
                  >
                    <SelectTrigger className="flex-1" data-testid="select-visit-reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_REASONS.filter((r) => !reasons.includes(r)).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="outline" onClick={addReason} disabled={!selectedReason} data-testid="button-add-reason">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select all applicable reasons for your visit</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reasons.map((reason, i) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-md">
                        {reason}
                        <button type="button" onClick={() => removeReason(i)} className="ml-1" data-testid={`button-remove-reason-${i}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Give details of any significant dates on which the applicant needs to be in Australia</Label>
                <Textarea
                  value={(formData.significantDates as string) || ""}
                  onChange={(e) => updateFormData({ significantDates: e.target.value })}
                  className="resize-none min-h-[100px]"
                  placeholder="Enter any significant dates and reasons..."
                  data-testid="textarea-significant-dates"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Group processing</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Select Yes if this application is part of a group of applications being lodged together.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">Is this application being lodged as part of a group of applications?</p>
                <RadioGroup
                  value={(formData.groupProcessing as string) || ""}
                  onValueChange={(val) => updateFormData({ groupProcessing: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-group-processing"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="group-yes" data-testid="radio-group-yes" />
                    <Label htmlFor="group-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="group-no" data-testid="radio-group-no" />
                    <Label htmlFor="group-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.groupProcessing === "yes" && (
                  <div className="mt-4 space-y-3">
                    <Button variant="outline" size="sm" onClick={() => setGroupDialogOpen(true)} data-testid="button-select-group">
                      Select group
                    </Button>

                    {formData.groupAlreadyCreated === "yes" && Boolean(formData.groupId) && (
                      <p className="text-sm text-muted-foreground">
                        Group ID: <span className="font-medium text-foreground">{String(formData.groupId)}</span>
                      </p>
                    )}
                    {formData.groupAlreadyCreated === "no" && Boolean(formData.groupName) && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Group name: <span className="font-medium text-foreground">{String(formData.groupName)}</span></p>
                        {Boolean(formData.groupType) && (
                          <p>Group type: <span className="font-medium text-foreground">{String(formData.groupType)}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Special category of entry</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>This applies to foreign government representatives, United Nations travellers, or exempt group members.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">
                  Is the applicant travelling as a representative of a foreign government, travelling on a United Nations Laissez-Passer or a member of an exempt group?
                </p>
                <RadioGroup
                  value={(formData.specialCategory as string) || ""}
                  onValueChange={(val) => updateFormData({ specialCategory: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-special-category"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="special-yes" data-testid="radio-special-yes" />
                    <Label htmlFor="special-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="special-no" data-testid="radio-special-no" />
                    <Label htmlFor="special-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.specialCategory === "yes" && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-primary">Select the special category of entry</p>
                    <RadioGroup
                      value={(formData.specialCategoryType as string) || ""}
                      onValueChange={(val) => updateFormData({ specialCategoryType: val })}
                      className="space-y-2"
                      data-testid="radio-special-category-type"
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="foreign_gov" id="cat-foreign-gov" className="mt-0.5" data-testid="radio-cat-foreign-gov" />
                        <Label htmlFor="cat-foreign-gov" className="text-sm cursor-pointer leading-relaxed">
                          Travelling as a foreign government representative
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="un_laissez" id="cat-un" className="mt-0.5" data-testid="radio-cat-un" />
                        <Label htmlFor="cat-un" className="text-sm cursor-pointer leading-relaxed">
                          Travelling on a United Nations Laissez-Passer
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="exempt_group" id="cat-exempt" className="mt-0.5" data-testid="radio-cat-exempt" />
                        <Label htmlFor="cat-exempt" className="text-sm cursor-pointer leading-relaxed">
                          Member of an exempt group
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          )}

          {outsideAustralia === "no" && (
            <div className="space-y-6 border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Note: Applications for the Visitor visa made within Australia are for the Tourist stream of the visa.
              </p>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Further stay</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Provide details about your request to extend your stay in Australia.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-4">Give details of the request for further stay.</p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Length of further stay</Label>
                    <Select
                      value={(formData.furtherStayLength as string) || ""}
                      onValueChange={(val) => updateFormData({ furtherStayLength: val })}
                    >
                      <SelectTrigger data-testid="select-further-stay-length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        {FURTHER_STAY_LENGTHS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Requested end date</Label>
                    <Input
                      type="date"
                      value={(formData.requestedEndDate as string) || ""}
                      onChange={(e) => updateFormData({ requestedEndDate: e.target.value })}
                      data-testid="input-requested-end-date"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Note: If the request for further stay will result in the applicant being authorised to stay in Australia for more than 12 months on certain visitor, working holiday and bridging visas, they must demonstrate that they have exceptional reasons for the further stay. Provide all details.
                  </p>

                  <div className="space-y-2">
                    <Label className="text-sm">Reason for further stay</Label>
                    <Textarea
                      value={(formData.furtherStayReason as string) || ""}
                      onChange={(e) => updateFormData({ furtherStayReason: e.target.value })}
                      className="resize-none min-h-[100px]"
                      placeholder="Provide your reasons for requesting further stay..."
                      data-testid="textarea-further-stay-reason"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-primary">Special category of entry</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>This applies to foreign government representatives, United Nations travellers, or exempt group members.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm mb-3">
                  Is the applicant travelling as a representative of a foreign government, travelling on a United Nations Laissez-Passer or a member of an exempt group?
                </p>
                <RadioGroup
                  value={(formData.specialCategory as string) || ""}
                  onValueChange={(val) => updateFormData({ specialCategory: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-special-category-inside"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="special-yes-in" data-testid="radio-special-yes-inside" />
                    <Label htmlFor="special-yes-in" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="special-no-in" data-testid="radio-special-no-inside" />
                    <Label htmlFor="special-no-in" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.specialCategory === "yes" && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-primary">Select the special category of entry</p>
                    <RadioGroup
                      value={(formData.specialCategoryType as string) || ""}
                      onValueChange={(val) => updateFormData({ specialCategoryType: val })}
                      className="space-y-2"
                      data-testid="radio-special-category-type-inside"
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="foreign_gov" id="cat-foreign-gov-in" className="mt-0.5" data-testid="radio-cat-foreign-gov-inside" />
                        <Label htmlFor="cat-foreign-gov-in" className="text-sm cursor-pointer leading-relaxed">
                          Travelling as a foreign government representative
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="un_laissez" id="cat-un-in" className="mt-0.5" data-testid="radio-cat-un-inside" />
                        <Label htmlFor="cat-un-in" className="text-sm cursor-pointer leading-relaxed">
                          Travelling on a United Nations Laissez-Passer
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <RadioGroupItem value="exempt_group" id="cat-exempt-in" className="mt-0.5" data-testid="radio-cat-exempt-inside" />
                        <Label htmlFor="cat-exempt-in" className="text-sm cursor-pointer leading-relaxed">
                          Member of an exempt group
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GroupDetailsDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        formData={formData}
        updateFormData={updateFormData}
      />

      <Dialog open={streamWarningOpen} onOpenChange={setStreamWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">Warning!</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md p-4 text-sm leading-relaxed">
            The Tourist stream is intended for applicants whose primary travel purpose is tourism. If the primary purpose of the applicant's travel is to undertake business activities in Australia, the appropriate stream is the Business Visitor stream. Check the Stream and Reasons for visiting fields and correct if necessary. To continue with the selection click Confirm.
          </div>
          <div className="flex items-center justify-between gap-2 pt-2">
            <Button variant="outline" onClick={cancelWarningReason} data-testid="button-stream-warning-cancel">Cancel</Button>
            <Button onClick={confirmWarningReason} data-testid="button-stream-warning-confirm">Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const NAME_CHANGE_REASONS = [
  "Deed poll",
  "Marriage",
  "Other",
];

function Step3Applicant({ formData, updateFormData }: StepProps) {
  const [otherNameDialogOpen, setOtherNameDialogOpen] = useState(false);
  const [otherNameFamily, setOtherNameFamily] = useState("");
  const [otherNameGiven, setOtherNameGiven] = useState("");
  const [otherNameReason, setOtherNameReason] = useState("");
  const otherNames = (formData.otherNames as Array<{ familyName: string; givenNames: string; reason: string }>) || [];
  const [citizenshipCountrySelect, setCitizenshipCountrySelect] = useState("");
  const otherCitizenships = (formData.otherCitizenships as string[]) || [];

  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false);
  const [idCardFamily, setIdCardFamily] = useState("");
  const [idCardGiven, setIdCardGiven] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardCountry, setIdCardCountry] = useState("");
  const [idCardIssueDate, setIdCardIssueDate] = useState("");
  const [idCardExpiryDate, setIdCardExpiryDate] = useState("");
  const nationalIdCards = (formData.nationalIdCards as Array<{ familyName: string; givenNames: string; idNumber: string; country: string; issueDate: string; expiryDate: string }>) || [];

  const addNationalIdCard = () => {
    const updated = [...nationalIdCards, {
      familyName: idCardFamily,
      givenNames: idCardGiven,
      idNumber: idCardNumber,
      country: idCardCountry,
      issueDate: idCardIssueDate,
      expiryDate: idCardExpiryDate,
    }];
    updateFormData({ nationalIdCards: updated });
    setIdCardFamily("");
    setIdCardGiven("");
    setIdCardNumber("");
    setIdCardCountry("");
    setIdCardIssueDate("");
    setIdCardExpiryDate("");
    setIdCardDialogOpen(false);
  };

  const removeNationalIdCard = (index: number) => {
    const updated = nationalIdCards.filter((_, i) => i !== index);
    updateFormData({ nationalIdCards: updated });
  };

  const TRAVEL_DOC_TYPES = [
    "DFTTA",
    "Immicard",
    "Passport",
    "PL056(M56)",
    "Titre de voyage",
    "Other travel document",
  ];

  const [travelDocDialogOpen, setTravelDocDialogOpen] = useState(false);
  const [travelDocType, setTravelDocType] = useState("");
  const [travelDocNationality, setTravelDocNationality] = useState("");
  const [travelDocDob, setTravelDocDob] = useState("");
  const [travelDocNumber, setTravelDocNumber] = useState("");
  const [travelDocSex, setTravelDocSex] = useState("");
  const [travelDocExpiry, setTravelDocExpiry] = useState("");
  const [travelDocPlaceOfIssue, setTravelDocPlaceOfIssue] = useState("");
  const [travelDocCountry, setTravelDocCountry] = useState("");
  const [travelDocIssueDate, setTravelDocIssueDate] = useState("");
  const otherTravelDocs = (formData.otherTravelDocs as Array<{ docType: string; name: string; docNumber: string; country: string; nationality: string; dob: string; sex?: string; expiry?: string; placeOfIssue?: string; issueDate?: string }>) || [];

  const autoName = [formData.familyName, formData.givenNames].filter(Boolean).join(", ");

  const addTravelDoc = () => {
    if (travelDocType) {
      const isAustralianDoc = travelDocType === "DFTTA" || travelDocType === "Immicard";
      const updated = [...otherTravelDocs, {
        docType: travelDocType,
        name: (isAustralianDoc || travelDocType === "Passport") ? autoName : "",
        docNumber: travelDocNumber,
        country: isAustralianDoc ? "AUSTRALIA - AUS" : travelDocCountry,
        nationality: travelDocNationality,
        dob: travelDocDob,
        sex: travelDocSex,
        expiry: travelDocExpiry,
        placeOfIssue: travelDocPlaceOfIssue,
        issueDate: travelDocIssueDate,
      }];
      updateFormData({ otherTravelDocs: updated });
      setTravelDocType("");
      setTravelDocNationality("");
      setTravelDocDob("");
      setTravelDocNumber("");
      setTravelDocSex("");
      setTravelDocExpiry("");
      setTravelDocPlaceOfIssue("");
      setTravelDocCountry("");
      setTravelDocIssueDate("");
      setTravelDocDialogOpen(false);
    }
  };

  const removeTravelDoc = (index: number) => {
    const updated = otherTravelDocs.filter((_, i) => i !== index);
    updateFormData({ otherTravelDocs: updated });
  };

  const addCitizenship = () => {
    if (citizenshipCountrySelect && !otherCitizenships.includes(citizenshipCountrySelect)) {
      updateFormData({ otherCitizenships: [...otherCitizenships, citizenshipCountrySelect] });
      setCitizenshipCountrySelect("");
    }
  };

  const removeCitizenship = (index: number) => {
    const updated = otherCitizenships.filter((_, i) => i !== index);
    updateFormData({ otherCitizenships: updated });
  };

  const addOtherName = () => {
    if (otherNameFamily || otherNameGiven) {
      const updated = [...otherNames, { familyName: otherNameFamily, givenNames: otherNameGiven, reason: otherNameReason }];
      updateFormData({ otherNames: updated });
      setOtherNameFamily("");
      setOtherNameGiven("");
      setOtherNameReason("");
      setOtherNameDialogOpen(false);
    }
  };

  const removeOtherName = (index: number) => {
    const updated = otherNames.filter((_, i) => i !== index);
    updateFormData({ otherNames: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 shrink-0">Information:</span>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Entering names incorrectly may result in denial of permission to board an aircraft to Australia, or result in delays in border processing on arrival to Australia, even if the applicant has been granted a visa.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Applicant</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-primary">Passport details</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Enter the applicant's passport details exactly as they appear in their passport.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Enter the following details as they appear in the applicant's personal passport.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Family name</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.familyName as string) || ""}
                    onChange={(e) => updateFormData({ familyName: e.target.value })}
                    data-testid="input-family-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Given names</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.givenNames as string) || ""}
                    onChange={(e) => updateFormData({ givenNames: e.target.value })}
                    data-testid="input-given-names"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Sex</Label>
                <div className="col-span-2">
                  <RadioGroup
                    value={(formData.sex as string) || ""}
                    onValueChange={(val) => updateFormData({ sex: val })}
                    className="flex items-center gap-6"
                    data-testid="radio-sex"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="sex-female" data-testid="radio-sex-female" />
                      <Label htmlFor="sex-female" className="text-sm cursor-pointer">Female</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="sex-male" data-testid="radio-sex-male" />
                      <Label htmlFor="sex-male" className="text-sm cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="other" id="sex-other" data-testid="radio-sex-other" />
                      <Label htmlFor="sex-other" className="text-sm cursor-pointer">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Date of birth</Label>
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={(formData.dateOfBirth as string) || ""}
                    onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                    data-testid="input-date-of-birth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Passport number</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.passportNumber as string) || ""}
                    onChange={(e) => updateFormData({ passportNumber: e.target.value })}
                    data-testid="input-passport-number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Country of passport</Label>
                <div className="col-span-2">
                  <Select
                    value={(formData.countryOfPassport as string) || ""}
                    onValueChange={(val) => updateFormData({ countryOfPassport: val })}
                  >
                    <SelectTrigger data-testid="select-country-of-passport">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Nationality of passport holder</Label>
                <div className="col-span-2">
                  <Select
                    value={(formData.nationalityOfHolder as string) || ""}
                    onValueChange={(val) => updateFormData({ nationalityOfHolder: val })}
                  >
                    <SelectTrigger data-testid="select-nationality-of-holder">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Date of issue</Label>
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={(formData.dateOfIssue as string) || ""}
                    onChange={(e) => updateFormData({ dateOfIssue: e.target.value })}
                    data-testid="input-date-of-issue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Date of expiry</Label>
                <div className="col-span-2">
                  <Input
                    type="date"
                    value={(formData.dateOfExpiry as string) || ""}
                    onChange={(e) => updateFormData({ dateOfExpiry: e.target.value })}
                    data-testid="input-date-of-expiry"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Place of issue / issuing authority</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.placeOfIssue as string) || ""}
                    onChange={(e) => updateFormData({ placeOfIssue: e.target.value })}
                    data-testid="input-place-of-issue"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">It is strongly recommended that the passport be valid for at least six months.</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">National identity card</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have a national identity card?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A national identity card is a government-issued document used to verify a person's identity.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasNationalIdCard as string) || ""}
              onValueChange={(val) => updateFormData({ hasNationalIdCard: val })}
              className="flex items-center gap-6"
              data-testid="radio-national-id-card"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="national-id-yes" data-testid="radio-national-id-yes" />
                <Label htmlFor="national-id-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="national-id-no" data-testid="radio-national-id-no" />
                <Label htmlFor="national-id-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>

            {formData.hasNationalIdCard === "yes" && (
              <div className="mt-4 border rounded-md">
                <div className="px-3 py-2 border-b">
                  <span className="text-sm font-semibold text-primary">Add details</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-semibold">Family name</th>
                        <th className="text-left px-3 py-2 font-semibold">Given names</th>
                        <th className="text-left px-3 py-2 font-semibold">ID number</th>
                        <th className="text-left px-3 py-2 font-semibold">Country</th>
                        <th className="text-left px-3 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nationalIdCards.map((card, i) => (
                        <tr key={i} className="border-b last:border-b-0" data-testid={`row-id-card-${i}`}>
                          <td className="px-3 py-2">{card.familyName}</td>
                          <td className="px-3 py-2">{card.givenNames}</td>
                          <td className="px-3 py-2">{card.idNumber}</td>
                          <td className="px-3 py-2">{card.country}</td>
                          <td className="px-3 py-2">
                            <Button variant="outline" size="sm" onClick={() => removeNationalIdCard(i)} data-testid={`button-remove-id-card-${i}`}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => {
                    setIdCardFamily("");
                    setIdCardGiven("");
                    setIdCardNumber("");
                    setIdCardCountry("");
                    setIdCardIssueDate("");
                    setIdCardExpiryDate("");
                    setIdCardDialogOpen(true);
                  }} data-testid="button-add-id-card">
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-2">Pacific-Australia Card</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The Pacific-Australia Card is issued through an invitation process to Pacific leaders. If the applicant does not hold a Pacific-Australia Card, select 'No' for this question.
            </p>
            <p className="text-sm mb-3">Is the applicant a Pacific-Australia Card holder?</p>
            <RadioGroup
              value={(formData.isPacificAustraliaCardHolder as string) || ""}
              onValueChange={(val) => updateFormData({ isPacificAustraliaCardHolder: val })}
              className="flex items-center gap-6"
              data-testid="radio-pacific-australia-card"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="pacific-card-yes" data-testid="radio-pacific-card-yes" />
                <Label htmlFor="pacific-card-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="pacific-card-no" data-testid="radio-pacific-card-no" />
                <Label htmlFor="pacific-card-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>

            {formData.isPacificAustraliaCardHolder === "yes" && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-1 block">Pacific-Australia Card serial number (printed on the front of your card)</Label>
                <Input
                  value={(formData.pacificAustraliaCardSerial as string) || ""}
                  onChange={(e) => updateFormData({ pacificAustraliaCardSerial: e.target.value })}
                  data-testid="input-pacific-card-serial"
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-primary">Place of birth</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Enter the applicant's place of birth as shown on their birth certificate or passport.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Town / City</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.birthTownCity as string) || ""}
                    onChange={(e) => updateFormData({ birthTownCity: e.target.value })}
                    data-testid="input-birth-town-city"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">State / Province</Label>
                <div className="col-span-2">
                  <Input
                    value={(formData.birthStateProvince as string) || ""}
                    onChange={(e) => updateFormData({ birthStateProvince: e.target.value })}
                    data-testid="input-birth-state-province"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label className="text-sm">Country of birth</Label>
                <div className="col-span-2">
                  <Select
                    value={(formData.birthCountry as string) || ""}
                    onValueChange={(val) => updateFormData({ birthCountry: val })}
                  >
                    <SelectTrigger data-testid="select-birth-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Relationship status</h3>
            <div className="grid grid-cols-3 items-center gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Relationship status</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Select the applicant's current relationship status.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="col-span-2">
                <Select
                  value={(formData.relationshipStatus as string) || ""}
                  onValueChange={(val) => updateFormData({ relationshipStatus: val })}
                >
                  <SelectTrigger data-testid="select-relationship-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Other names / spellings</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Is this applicant currently, or have they ever been known by any other names?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include maiden names, aliases, or any other names the applicant has been known by.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasOtherNames as string) || ""}
              onValueChange={(val) => updateFormData({ hasOtherNames: val })}
              className="flex items-center gap-6"
              data-testid="radio-other-names"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="other-names-yes" data-testid="radio-other-names-yes" />
                <Label htmlFor="other-names-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="other-names-no" data-testid="radio-other-names-no" />
                <Label htmlFor="other-names-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>

            {formData.hasOtherNames === "yes" && (
              <div className="mt-4 border rounded-md">
                <div className="px-3 py-2 border-b">
                  <span className="text-sm font-semibold text-primary">Add details</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-3 py-2 font-semibold">Family name</th>
                        <th className="text-left px-3 py-2 font-semibold">Given names</th>
                        <th className="text-left px-3 py-2 font-semibold">Reason</th>
                        <th className="text-left px-3 py-2 font-semibold">
                          <span className="flex items-center gap-1">
                            Actions
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Add or remove other names</p>
                              </TooltipContent>
                            </Tooltip>
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherNames.map((name, i) => (
                        <tr key={i} className="border-b last:border-b-0" data-testid={`row-other-name-${i}`}>
                          <td className="px-3 py-2">{name.familyName}</td>
                          <td className="px-3 py-2">{name.givenNames}</td>
                          <td className="px-3 py-2">{name.reason}</td>
                          <td className="px-3 py-2">
                            <Button variant="outline" size="sm" onClick={() => removeOtherName(i)} data-testid={`button-remove-other-name-${i}`}>
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => {
                    setOtherNameFamily("");
                    setOtherNameGiven("");
                    setOtherNameReason("");
                    setOtherNameDialogOpen(true);
                  }} data-testid="button-add-other-name">
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Citizenship</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm">Is this applicant a citizen of the selected country of passport?</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Indicate whether the applicant holds citizenship in the country that issued their passport.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <RadioGroup
                  value={(formData.citizenOfPassportCountry as string) || ""}
                  onValueChange={(val) => updateFormData({ citizenOfPassportCountry: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-citizen-passport-country"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="citizen-passport-yes" data-testid="radio-citizen-passport-yes" />
                    <Label htmlFor="citizen-passport-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="citizen-passport-no" data-testid="radio-citizen-passport-no" />
                    <Label htmlFor="citizen-passport-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm">Is this applicant a citizen of any other country?</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Indicate whether the applicant holds citizenship in any country other than their passport country.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <RadioGroup
                  value={(formData.citizenOfOtherCountry as string) || ""}
                  onValueChange={(val) => updateFormData({ citizenOfOtherCountry: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-citizen-other-country"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="citizen-other-yes" data-testid="radio-citizen-other-yes" />
                    <Label htmlFor="citizen-other-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="citizen-other-no" data-testid="radio-citizen-other-no" />
                    <Label htmlFor="citizen-other-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>

                {formData.citizenOfOtherCountry === "yes" && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm min-w-[100px]">List countries</Label>
                      <Select value={citizenshipCountrySelect} onValueChange={setCitizenshipCountrySelect}>
                        <SelectTrigger className="flex-1" data-testid="select-other-citizenship-country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="outline" onClick={addCitizenship} data-testid="button-add-citizenship">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select and add all countries where the applicant holds citizenship</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {otherCitizenships.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {otherCitizenships.map((country, i) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm" data-testid={`tag-citizenship-${i}`}>
                            {country}
                            <button onClick={() => removeCitizenship(i)} className="text-muted-foreground hover-elevate rounded-sm" data-testid={`button-remove-citizenship-${i}`}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Previous travel to Australia</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-3">Has this applicant previously travelled to Australia?</p>
                <RadioGroup
                  value={(formData.previouslyTravelledToAustralia as string) || ""}
                  onValueChange={(val) => updateFormData({ previouslyTravelledToAustralia: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-previously-travelled"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="prev-travel-yes" data-testid="radio-prev-travel-yes" />
                    <Label htmlFor="prev-travel-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="prev-travel-no" data-testid="radio-prev-travel-no" />
                    <Label htmlFor="prev-travel-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <p className="text-sm mb-3">Has this applicant previously applied for a visa to Australia?</p>
                <RadioGroup
                  value={(formData.previouslyAppliedForVisa as string) || ""}
                  onValueChange={(val) => updateFormData({ previouslyAppliedForVisa: val })}
                  className="flex items-center gap-6"
                  data-testid="radio-previously-applied"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="prev-applied-yes" data-testid="radio-prev-applied-yes" />
                    <Label htmlFor="prev-applied-yes" className="text-sm cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="prev-applied-no" data-testid="radio-prev-applied-no" />
                    <Label htmlFor="prev-applied-no" className="text-sm cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Grant number</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have an Australian visa grant number?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>A visa grant number is issued when a visa is granted. It can be found on the visa grant notification letter.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasGrantNumber as string) || ""}
              onValueChange={(val) => updateFormData({ hasGrantNumber: val })}
              className="flex items-center gap-6"
              data-testid="radio-grant-number"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="grant-number-yes" data-testid="radio-grant-number-yes" />
                <Label htmlFor="grant-number-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="grant-number-no" data-testid="radio-grant-number-no" />
                <Label htmlFor="grant-number-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>

            {formData.hasGrantNumber === "yes" && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-1 block">Australian visa grant number (if known)</Label>
                <Input
                  value={(formData.visaGrantNumber as string) || ""}
                  onChange={(e) => updateFormData({ visaGrantNumber: e.target.value })}
                  data-testid="input-visa-grant-number"
                />
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Other passports or documents for travel</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have any other passports or documents for travel?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include any other valid passports or travel documents held by the applicant.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasOtherPassports as string) || ""}
              onValueChange={(val) => updateFormData({ hasOtherPassports: val })}
              className="flex items-center gap-6"
              data-testid="radio-other-passports"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="other-passports-yes" data-testid="radio-other-passports-yes" />
                <Label htmlFor="other-passports-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="other-passports-no" data-testid="radio-other-passports-no" />
                <Label htmlFor="other-passports-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>

            {formData.hasOtherPassports === "yes" && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm">Does the applicant intend to travel on a United Nations Laissez-Passer?</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>A United Nations Laissez-Passer is a travel document issued by the United Nations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <RadioGroup
                    value={(formData.travelOnUNLaissezPasser as string) || ""}
                    onValueChange={(val) => updateFormData({ travelOnUNLaissezPasser: val })}
                    className="flex items-center gap-6"
                    data-testid="radio-un-laissez-passer"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="un-laissez-yes" data-testid="radio-un-laissez-yes" />
                      <Label htmlFor="un-laissez-yes" className="text-sm cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="un-laissez-no" data-testid="radio-un-laissez-no" />
                      <Label htmlFor="un-laissez-no" className="text-sm cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <p className="text-sm text-muted-foreground">
                  Give details of any other non United Nations passports or documents for travel that might have been previously used to travel to Australia.
                </p>

                <div className="border rounded-md">
                  <div className="px-3 py-2 border-b">
                    <span className="text-sm font-semibold text-primary">Add details</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left px-3 py-2 font-semibold">Name</th>
                          <th className="text-left px-3 py-2 font-semibold">Passport / document number</th>
                          <th className="text-left px-3 py-2 font-semibold">Country of issue</th>
                          <th className="text-left px-3 py-2 font-semibold">
                            <span className="flex items-center gap-1">
                              Actions
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Add or remove travel documents</p>
                                </TooltipContent>
                              </Tooltip>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {otherTravelDocs.map((doc, i) => (
                          <tr key={i} className="border-b last:border-b-0" data-testid={`row-travel-doc-${i}`}>
                            <td className="px-3 py-2">{doc.name || doc.docType}</td>
                            <td className="px-3 py-2">{doc.docNumber}</td>
                            <td className="px-3 py-2">{doc.country}</td>
                            <td className="px-3 py-2">
                              <Button variant="outline" size="sm" onClick={() => removeTravelDoc(i)} data-testid={`button-remove-travel-doc-${i}`}>
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 py-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => {
                      setTravelDocType("");
                      setTravelDocNationality("");
                      setTravelDocDob("");
                      setTravelDocNumber("");
                      setTravelDocSex("");
                      setTravelDocExpiry("");
                      setTravelDocPlaceOfIssue("");
                      setTravelDocCountry("");
                      setTravelDocIssueDate("");
                      setTravelDocDialogOpen(true);
                    }} data-testid="button-add-travel-doc">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Other identity documents</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Does this applicant have other identity documents?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Include any other government-issued identity documents such as driver's licence or national ID.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasOtherIdentityDocs as string) || ""}
              onValueChange={(val) => updateFormData({ hasOtherIdentityDocs: val })}
              className="flex items-center gap-6"
              data-testid="radio-other-identity-docs"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="other-identity-yes" data-testid="radio-other-identity-yes" />
                <Label htmlFor="other-identity-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="other-identity-no" data-testid="radio-other-identity-no" />
                <Label htmlFor="other-identity-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Health examination</h3>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm">Has this applicant undertaken a health examination for an Australian visa in the last 12 months?</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>If the applicant has completed a health examination for a previous Australian visa application within the last 12 months, select Yes.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup
              value={(formData.hasHealthExamination as string) || ""}
              onValueChange={(val) => updateFormData({ hasHealthExamination: val })}
              className="flex items-center gap-6"
              data-testid="radio-health-examination"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="health-exam-yes" data-testid="radio-health-exam-yes" />
                <Label htmlFor="health-exam-yes" className="text-sm cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="health-exam-no" data-testid="radio-health-exam-no" />
                <Label htmlFor="health-exam-no" className="text-sm cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Dialog open={otherNameDialogOpen} onOpenChange={setOtherNameDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Other names / spellings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Family name</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={otherNameFamily}
                  onChange={(e) => setOtherNameFamily(e.target.value)}
                  data-testid="input-other-family-name"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the family name (surname)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Given names</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={otherNameGiven}
                  onChange={(e) => setOtherNameGiven(e.target.value)}
                  data-testid="input-other-given-names"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter all given names</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Reason for name change</Label>
              <div className="flex items-center gap-2">
                <Select value={otherNameReason} onValueChange={setOtherNameReason}>
                  <SelectTrigger data-testid="select-other-name-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {NAME_CHANGE_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the reason for the name change</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setOtherNameDialogOpen(false)} data-testid="button-cancel-other-name">
              Cancel
            </Button>
            <Button onClick={addOtherName} data-testid="button-confirm-other-name">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={idCardDialogOpen} onOpenChange={setIdCardDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">National identity card</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Enter details exactly as shown on the national identity card.
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground inline ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Details must match the national identity card exactly</p>
              </TooltipContent>
            </Tooltip>
          </p>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Family name</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={idCardFamily}
                  onChange={(e) => setIdCardFamily(e.target.value)}
                  data-testid="input-id-card-family-name"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter the family name as shown on the identity card</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Given names</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={idCardGiven}
                  onChange={(e) => setIdCardGiven(e.target.value)}
                  data-testid="input-id-card-given-names"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enter all given names as shown on the identity card</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Identification number</Label>
              <Input
                value={idCardNumber}
                onChange={(e) => setIdCardNumber(e.target.value)}
                data-testid="input-id-card-number"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
              <Select value={idCardCountry} onValueChange={setIdCardCountry}>
                <SelectTrigger data-testid="select-id-card-country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: If the National identity card does not have a Date of issue or a Date of expiry, do not enter a date. Leave the field/s blank.
            </p>
            <div>
              <Label className="text-sm font-medium mb-1 block">Date of issue</Label>
              <Input
                type="date"
                value={idCardIssueDate}
                onChange={(e) => setIdCardIssueDate(e.target.value)}
                data-testid="input-id-card-issue-date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
              <Input
                type="date"
                value={idCardExpiryDate}
                onChange={(e) => setIdCardExpiryDate(e.target.value)}
                data-testid="input-id-card-expiry-date"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setIdCardDialogOpen(false)} data-testid="button-cancel-id-card">
              Cancel
            </Button>
            <Button onClick={addNationalIdCard} data-testid="button-confirm-id-card">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={travelDocDialogOpen} onOpenChange={setTravelDocDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Other passport or document for travel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1 block">Type of document</Label>
              <div className="flex items-center gap-2">
                <Select value={travelDocType} onValueChange={setTravelDocType}>
                  <SelectTrigger data-testid="select-travel-doc-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the type of travel document</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {travelDocType === "DFTTA" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-travel-doc-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-travel-doc-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-travel-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <p className="text-sm font-medium">AUSTRALIA - AUS</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-travel-doc-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {travelDocType === "Immicard" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the document for travel.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-immicard-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sex</Label>
                  <div className="flex items-center gap-4">
                    {["Female", "Male", "Other"].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="travelDocSex"
                          value={option}
                          checked={travelDocSex === option}
                          onChange={(e) => setTravelDocSex(e.target.value)}
                          className="accent-primary"
                          data-testid={`radio-immicard-sex-${option.toLowerCase()}`}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-immicard-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Document number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-immicard-doc-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <p className="text-sm font-medium">AUSTRALIA - AUS</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of document holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-immicard-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
                  <Input
                    type="date"
                    value={travelDocExpiry}
                    onChange={(e) => setTravelDocExpiry(e.target.value)}
                    data-testid="input-immicard-expiry"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Place of issue / issuing authority</Label>
                  <Input
                    value={travelDocPlaceOfIssue}
                    onChange={(e) => setTravelDocPlaceOfIssue(e.target.value)}
                    data-testid="input-immicard-place-of-issue"
                  />
                </div>
              </>
            )}

            {travelDocType === "Passport" && (
              <>
                <p className="text-sm text-muted-foreground">Enter details as shown on the passport.</p>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Name</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={autoName}
                      readOnly
                      className="bg-muted/50"
                      data-testid="input-passport-name"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Name auto-populated from applicant details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sex</Label>
                  <div className="flex items-center gap-4">
                    {["Female", "Male", "Other"].map((option) => (
                      <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="travelDocSex"
                          value={option}
                          checked={travelDocSex === option}
                          onChange={(e) => setTravelDocSex(e.target.value)}
                          className="accent-primary"
                          data-testid={`radio-passport-sex-${option.toLowerCase()}`}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of birth</Label>
                  <Input
                    type="date"
                    value={travelDocDob}
                    onChange={(e) => setTravelDocDob(e.target.value)}
                    data-testid="input-passport-dob"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Passport number</Label>
                  <Input
                    value={travelDocNumber}
                    onChange={(e) => setTravelDocNumber(e.target.value)}
                    data-testid="input-passport-number"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Country of issue</Label>
                  <Select value={travelDocCountry} onValueChange={setTravelDocCountry}>
                    <SelectTrigger data-testid="select-passport-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Nationality of passport holder</Label>
                  <Select value={travelDocNationality} onValueChange={setTravelDocNationality}>
                    <SelectTrigger data-testid="select-passport-nationality">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of issue</Label>
                  <Input
                    type="date"
                    value={travelDocIssueDate}
                    onChange={(e) => setTravelDocIssueDate(e.target.value)}
                    data-testid="input-passport-issue-date"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Date of expiry</Label>
                  <Input
                    type="date"
                    value={travelDocExpiry}
                    onChange={(e) => setTravelDocExpiry(e.target.value)}
                    data-testid="input-passport-expiry"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1 block">Place of issue / issuing authority</Label>
                  <Input
                    value={travelDocPlaceOfIssue}
                    onChange={(e) => setTravelDocPlaceOfIssue(e.target.value)}
                    data-testid="input-passport-place-of-issue"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setTravelDocDialogOpen(false)} data-testid="button-cancel-travel-doc">
              Cancel
            </Button>
            <Button onClick={addTravelDoc} data-testid="button-confirm-travel-doc">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplicationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({});
  const [currentStep, setCurrentStep] = useState(1);

  const { data: application, isLoading } = useQuery<Application>({
    queryKey: ["/api/applications", params.id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    if (application) {
      const fd = (application.formData || {}) as FormData;
      setFormData(fd);
      setCurrentStep(application.currentStep);
    }
  }, [application]);

  const saveMutation = useMutation({
    mutationFn: async (data: { formData?: FormData; currentStep?: number }) => {
      const res = await apiRequest("PATCH", `/api/applications/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", params.id] });
    },
  });

  const updateFormData = useCallback((updates: FormData) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSave = useCallback(() => {
    saveMutation.mutate({ formData, currentStep });
    toast({ title: "Saved", description: "Your progress has been saved." });
  }, [formData, currentStep, saveMutation, toast]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      saveMutation.mutate(
        { formData, currentStep: newStep },
        {
          onSuccess: () => {
            setCurrentStep(newStep);
          },
        }
      );
    }
  }, [currentStep, formData, saveMutation]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !formData.termsAccepted) {
      toast({
        title: "Terms required",
        description: "Please read and agree to the terms and conditions before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2) {
      if (!formData.outsideAustralia) {
        toast({
          title: "Required field",
          description: "Please indicate whether the applicant is currently outside Australia.",
          variant: "destructive",
        });
        return;
      }
    }

    const newStep = currentStep + 1;
    saveMutation.mutate(
      { formData, currentStep: newStep },
      {
        onSuccess: () => {
          setCurrentStep(newStep);
          toast({ title: `Step ${currentStep} complete`, description: "Moving to the next step." });
        },
      }
    );
  }, [currentStep, formData, saveMutation, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Application not found.</p>
            <Button className="mt-4" onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSteps = 20;
  const progressPercent = (currentStep / totalSteps) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Terms formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2ApplicationContext formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Applicant formData={formData} updateFormData={updateFormData} />;
      default:
        return (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Step {currentStep} is coming soon. Share the screenshot for this step to continue building.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Global Visas" className="h-8 brightness-0 invert object-contain" data-testid="img-logo-header" />
            <span className="font-semibold text-sm">Application for a Visitor Short Stay Visa</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-1">
        {application.id && (
          <p className="text-xs text-muted-foreground mb-2" data-testid="text-trn">
            Transaction Reference Number (TRN): {application.id.substring(0, 10).toUpperCase()}
          </p>
        )}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Progress value={progressPercent} className="flex-1 h-2" data-testid="progress-bar" />
          </div>
          <p className="text-center text-sm text-muted-foreground" data-testid="text-step-counter">{currentStep}/{totalSteps}</p>
        </div>

        {renderStep()}
      </div>

      <div className="border-t bg-card mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={handlePrevious} disabled={saveMutation.isPending} data-testid="button-previous">
                <ArrowLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} data-testid="button-go-to-account">
              Go to my account
            </Button>
          </div>
          <Button onClick={handleNext} disabled={saveMutation.isPending} data-testid="button-next">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
